import {env} from '@/lib/runtime-env';
import {rawDb} from '../db';
import {LA_TODAY,dateKey} from './availability';
export function mileageRate(date:string){if(date>='2026-07-01'&&date<='2026-12-31')return .76;if(date>='2026-01-01'&&date<='2026-06-30')return .725;if(date.startsWith('2025-'))return .70;return null}
export async function mileageSettings(){const db=rawDb(),s=await db.prepare("SELECT * FROM cost_settings WHERE id='owner'").first<any>();const v=await db.prepare('SELECT id FROM vehicles WHERE archived=0 ORDER BY created_at LIMIT 1').first<any>();return {...s,base_address:s?.base_address||(env as any).BUSINESS_BASE_ADDRESS||'',default_vehicle:s?.default_vehicle||v?.id||null}}
export async function draftTrip(jobId:string,completed=false){
 const db=rawDb();if(await db.prepare('SELECT id FROM mileage WHERE job_id=?').bind(jobId).first())return;
 const job=await db.prepare('SELECT j.service,j.scheduled_date,j.status,CASE WHEN length(j.service_address)>0 THEN j.service_address ELSE c.address END AS address FROM jobs j JOIN customers c ON c.id=j.customer_id WHERE j.id=?').bind(jobId).first<any>();if(!job||job.status==='Cancelled')return;
 const s=await mileageSettings(),id=`job-${jobId}`,done=completed||['Completed','Paid','Invoice sent','Invoice ready'].includes(job.status);
 await db.batch([db.prepare("INSERT OR IGNORE INTO trip_records (id,trip_date,vehicle_id,route_json,purpose) SELECT ?,?,?,?,? WHERE NOT EXISTS (SELECT 1 FROM trip_jobs WHERE job_id=?)").bind(id,dateKey(job.scheduled_date)||LA_TODAY(),s.default_vehicle,JSON.stringify([s.base_address,job.address,s.base_address]),job.service,jobId),db.prepare('INSERT OR IGNORE INTO trip_jobs (job_id,trip_id) VALUES (?,?)').bind(jobId,id)]);
 const t=await db.prepare('SELECT t.* FROM trip_records t JOIN trip_jobs l ON l.trip_id=t.id WHERE l.job_id=?').bind(jobId).first<any>();if(!t)return;
 if(done&&t.status==='draft')await db.prepare("UPDATE trip_records SET status='recorded' WHERE id=? AND status='draft'").bind(t.id).run();
 if(!t.vehicle_id&&s.default_vehicle)await db.prepare('UPDATE trip_records SET vehicle_id=? WHERE id=? AND vehicle_id IS NULL').bind(s.default_vehicle,t.id).run();
 if(t.estimated_miles===null&&t.actual_miles===null&&routingReady()){
 const route=JSON.parse(t.route_json).map((x:string)=>x||s.base_address);if(route.every(Boolean)){try{const miles=await routeMiles(route);await db.prepare('UPDATE trip_records SET estimated_miles=?,route_json=? WHERE id=? AND estimated_miles IS NULL AND actual_miles IS NULL').bind(miles,JSON.stringify(route),t.id).run()}catch{/* A failed lookup never invents a distance or blocks a booking. */}}
 }
}
export function routingReady(){return !!(env as any).GOOGLE_MAPS_API_KEY}
export async function routeMiles(route:string[]){
 if(!routingReady())throw Error('Automatic mileage needs the maps connection. Your job is saved; no distance has been guessed.');
 const response=await fetch('https://routes.googleapis.com/directions/v2:computeRoutes',{method:'POST',headers:{'Content-Type':'application/json','X-Goog-Api-Key':(env as any).GOOGLE_MAPS_API_KEY,'X-Goog-FieldMask':'routes.distanceMeters'},body:JSON.stringify({origin:{address:route[0]},destination:{address:route.at(-1)},intermediates:route.slice(1,-1).map(address=>({address})),travelMode:'DRIVE'}),signal:AbortSignal.timeout(8000)});
 if(!response.ok)throw Error('Distance lookup is unavailable. Check the addresses or try again later.');const data=await response.json() as any,n=data.routes?.[0]?.distanceMeters;if(!Number.isFinite(n))throw Error('No driving route found. Check the addresses.');return Math.round(n/1609.344*10)/10;
}
