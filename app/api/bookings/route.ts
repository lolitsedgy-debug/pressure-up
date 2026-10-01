import{attachFunnel}from'../../../lib/funnel';
import {publishedWebsite} from '../../../lib/website';
import {customerIdentity} from '../../../lib/customer-identity';
import {validUpload} from '../../../lib/upload';
import {env} from '@/lib/runtime-env';
import {draftTrip} from '../../../lib/job-costs';
import {bookingMessages} from '../../../lib/delivery';
import {calculateQuote} from '../../../lib/quote';
import {rawDb} from '../../../db';
import {availabilityRows} from '../../../lib/availability-data';
import {dateKey,isBlocked,LA_TODAY} from '../../../lib/availability';
import {clean,isoDate,moneyValue,failure} from '../records-utils';
export async function POST(request:Request){
 const uploaded:string[]=[];let committed=false;
 try{
 if(Number(request.headers.get('content-length')||0)>52*1024*1024)return Response.json({error:'Please use smaller photos.'},{status:413});
 const form=request.headers.get('content-type')?.includes('multipart/form-data')?await request.formData():null,body=form?JSON.parse(String(form.get('data')||'{}')):await request.json() as any,c=body.customer||{},j=body.job||{},date=dateKey(String(j.date||'')),window=String(j.window||'').includes('12')?'afternoon':'morning',arrival=window==='morning'?'8–9 AM':'12–1 PM',quote=calculateQuote(body.selection||{},(await publishedWebsite()).services),price=quote.price;
 if(!isoDate(date)||date<=LA_TODAY()||!clean(c.firstName)||!clean(c.lastName)||!clean(c.address)||!/^\+?[\d\s().-]{10,22}$/.test(String(c.phone))||!/^\S+@\S+\.\S+$/.test(String(c.email)))return Response.json({error:'Enter your contact details and choose a future appointment date.'},{status:400});
 const max=new Date(LA_TODAY()+'T12:00:00Z');max.setUTCDate(max.getUTCDate()+120);if(date>max.toISOString().slice(0,10))return Response.json({error:'Choose a date in the next four months.'},{status:400});
 const availability=await availabilityRows();if(isBlocked(date,window,availability.rules,availability.blocks,availability.jobs,quote.duration))return Response.json({error:'That window is no longer available. Please choose another.'},{status:409});
 if(moneyValue(j.price)!==price)return Response.json({error:'Your estimate needs refreshing. Return to the plan and try again.'},{status:409});
 const customerId=crypto.randomUUID(),jobId=crypto.randomUUID(),manageToken=crypto.randomUUID().replaceAll('-','')+crypto.randomUUID().replaceAll('-',''),db=rawDb(),photos:any[]=[];
 if(form){const files=form.getAll('photos');if(files.length>8||files.reduce((n,f)=>n+(f instanceof File?f.size:0),0)>50*1024*1024)return Response.json({error:'Choose up to 8 files, 25 MB each and 50 MB total. Originals are never compressed.'},{status:413});for(const [i,file] of files.entries()){if(!validUpload(file))return Response.json({error:'Use a supported image or video up to 25 MB.'},{status:400});const thumb=form.get('thumbnail'+i);photos.push({id:crypto.randomUUID(),key:`jobs/${jobId}/${crypto.randomUUID()}`,type:file.type,file,name:clean(file.name),thumbnail:thumb instanceof File&&thumb.type==='image/jpeg'&&thumb.size<=512000?thumb:null,thumbnailKey:null})}}
 else for(const p of (Array.isArray(body.photos)?body.photos:[]).slice(0,8)){if(p.type!=='image')continue;const match=String(p.data||'').match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);if(!match||match[2].length>4*1024*1024)return Response.json({error:'Use JPG, PNG, or WebP photos under 3 MB each.'},{status:400});photos.push({id:crypto.randomUUID(),key:`jobs/${jobId}/${crypto.randomUUID()}`,type:match[1],bytes:Uint8Array.from(atob(match[2]),x=>x.charCodeAt(0)),name:clean(p.name)||'Customer photo'})}
 for(const p of photos){await env.BUCKET.put(p.key,p.file?await p.file.arrayBuffer():p.bytes,{httpMetadata:{contentType:p.type}});uploaded.push(p.key);if(p.thumbnail){p.thumbnailKey=p.key+'/thumbnail';await env.BUCKET.put(p.thumbnailKey,await p.thumbnail.arrayBuffer(),{httpMetadata:{contentType:'image/jpeg'}});uploaded.push(p.thumbnailKey)}}
 const service=quote.service,status=quote.review?'Call required':'Requested',identity=customerIdentity({firstName:clean(c.firstName),lastName:clean(c.lastName),phone:clean(c.phone),email:clean(c.email)});
 const results=await db.batch([
 db.prepare('INSERT OR IGNORE INTO customers (id,first_name,last_name,phone,email,address,language,consent,identity_key) VALUES (?,?,?,?,?,?,?,1,?)').bind(customerId,clean(c.firstName),clean(c.lastName),clean(c.phone),clean(c.email),clean(c.address),c.language==='Spanish'?'Spanish':'English',identity),
 db.prepare("INSERT INTO jobs (id,customer_id,service,scheduled_date,arrival_window,price,status,payment_method,city,estimate_json,manage_token,customer_note,duration_minutes,updates_opt_in,service_address) SELECT ?, (SELECT id FROM customers WHERE identity_key=?),?,?,?,?,?,?,?,?,?,?,?,?,? WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE scheduled_date=? AND status!='Cancelled' AND (CASE WHEN arrival_window LIKE '12%' THEN 720 ELSE 480 END)< ? AND (CASE WHEN arrival_window LIKE '12%' THEN 720 ELSE 480 END)+60+duration_minutes+30> ?)").bind(jobId,identity,service,date,arrival,price,status,j.payment==='Cash after service'?'Cash after service':'Card after service',clean(j.city)||'Lawndale',JSON.stringify([{name:service,amount:price}]),manageToken,clean(j.customerNote,1500),quote.duration,c.updatesOptIn?1:0,clean(c.address),date,(window==='morning'?480:720)+60+quote.duration+30,window==='morning'?480:720),
 ...photos.map(p=>db.prepare('INSERT INTO media (id,job_id,object_key,content_type,file_name,thumbnail_object_key) SELECT ?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM jobs WHERE id=?)').bind(p.id,jobId,p.key,p.type,p.name,p.thumbnailKey||null,jobId))]);
 if(!results[1].meta.changes){await db.prepare('DELETE FROM customers WHERE id=? AND NOT EXISTS (SELECT 1 FROM jobs WHERE customer_id=?) AND NOT EXISTS (SELECT 1 FROM notifications WHERE customer_id=?)').bind(customerId,customerId,customerId).run();await Promise.all(uploaded.map(k=>env.BUCKET.delete(k)));return Response.json({error:'Someone just requested that window. Please choose another.'},{status:409})}committed=true;await attachFunnel(jobId,body.funnelId,body.leadSource).catch(()=>{});
 await draftTrip(jobId).catch(()=>{});await bookingMessages(jobId).catch(()=>{});
 return Response.json({ok:true,jobId,manageUrl:`/manage/${manageToken}`},{status:201});
 }catch(e){if(!committed)await Promise.all(uploaded.map(k=>env.BUCKET.delete(k).catch(()=>{})));return failure(e)}
}
