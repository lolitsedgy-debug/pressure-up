// Synthetic-only recovery proof. Never reads production bindings or credentials.
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {randomBytes} from 'node:crypto';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,existsSync,cpSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname,resolve} from 'node:path';
import {tables,hash,createPackage,restorePackage} from './package.mjs';
import {sql,objects,route,owner,saved} from '../tests/readiness.mjs';
await import('../tests/invoice-protections.mjs');
await import('../tests/marketing.mjs');
const root=mkdtempSync(join(tmpdir(),'pressure-up-recovery-proof-')),source=join(root,'source');mkdirSync(join(source,'objects'),{recursive:true});
const stamp='2026-09-09',job=saved.jobId,media=sql.prepare('SELECT * FROM media LIMIT 1').get(),png=objects.get(media.object_key).bytes;
const insert=(table,row)=>sql.prepare(`INSERT INTO ${table} (${Object.keys(row).join(',')}) VALUES (${Object.keys(row).map(()=>'?').join(',')})`).run(...Object.values(row));
insert('vehicles',{id:'proof-car',nickname:'Synthetic car'});
sql.prepare('INSERT OR REPLACE INTO cost_settings (id,base_address,default_vehicle) VALUES (?,?,?)').run('main','Private synthetic base','proof-car');
insert('expenses',{id:'proof-expense',amount:84.27,vendor:'Synthetic merchant',category:'Supplies',expense_date:stamp,payment_method:'Cash',job_id:job,receipt_object_key:'receipts/proof-expense/original',receipt_sha256:hash(png),receipt_details:JSON.stringify({total:84.27,tax:7.26,reviewed:true})});
objects.set('receipts/proof-expense/original',{bytes:png});
insert('mileage',{id:'proof-mileage',trip_date:stamp,vehicle:'Synthetic car',origin:'Private base',destination:'Synthetic job',purpose:'Job travel',start_odometer:100,end_odometer:112,job_id:job});
const trip=sql.prepare('SELECT id FROM trip_records LIMIT 1').get().id;
sql.prepare('UPDATE trip_records SET vehicle_id=?,actual_miles=12,eligible_miles=12 WHERE id=?').run('proof-car',trip);
insert('trip_edits',{id:'proof-edit',trip_id:trip,before_json:'{}',after_json:'{"actual_miles":12}',reason:'Owner reviewed'});
insert('supplies',{id:'proof-supply',name:'Soap',unit:'gallon'});
insert('supply_movements',{id:'proof-movement',supply_id:'proof-supply',quantity:1,unit_cost:84.27,kind:'purchase',job_id:job,expense_id:'proof-expense',movement_date:stamp});
insert('estimate_funnels',{id:'proof-funnel',source:'Instagram',campaign:'proof',started_at:stamp,submitted_at:stamp,generated_at:stamp,booked_at:stamp,paid_at:stamp,job_id:job});
sql.prepare('UPDATE jobs SET funnel_id=?,lead_source=?,campaign=? WHERE id=?').run('proof-funnel','Instagram','proof',job);
insert('ad_spend',{id:'proof-ad',source:'Instagram',campaign:'proof',period_start:stamp,period_end:stamp,amount:10});
insert('availability_rules',{id:'proof-rule',weekday:0});insert('availability_blocks',{id:'proof-block',block_date:'2026-12-25'});
insert('owner_preferences',{id:'proof-owner',cards_json:'["revenue"]'});
// Actual published content structure is initialized through the existing application helper.
const website=await route('lib/website.ts');
await website.editorState();
if(!sql.prepare('SELECT count(*) n FROM website_content').get().n)throw Error('Website content fixture must use actual application initializer');
const content=sql.prepare('SELECT published_json FROM website_content LIMIT 1').get().published_json;
insert('website_versions',{id:'proof-version',content_json:content,description:'Synthetic snapshot',created_at:stamp});
insert('website_media',{id:'proof-website',object_key:'website/proof/original',name:'Synthetic website photo',content_type:'image/png',category:'website',created_at:stamp});
insert('website_public_media',{media_id:'proof-website'});objects.set('website/proof/original',{bytes:png});
objects.set('business/owner/proof',{bytes:png});sql.prepare('UPDATE business_settings SET owner_photo_key=?').run('business/owner/proof');
objects.set('unreferenced/proof-orphan',{bytes:Buffer.from('synthetic orphan - do not delete')});
for(const [key,o]of objects){const p=join(source,'objects',hash(key));mkdirSync(dirname(p),{recursive:true});writeFileSync(p,o.bytes)}
writeFileSync(join(source,'objects','object-index.json'),JSON.stringify([...objects.keys()]));
sql.prepare('VACUUM INTO ?').run(join(source,'business.sqlite'));
const pass=randomBytes(32).toString('hex'),input=join(root,'package');
const manifest=createPackage({database:join(source,'business.sqlite'),objects:join(source,'objects'),migrations:resolve('drizzle'),output:input,password:pass,offlineConfirmed:true});
assert.equal(Object.values(manifest.counts).filter(n=>n>0).length,27);
assert.deepEqual(manifest.diagnostics.orphans,['unreferenced/proof-orphan']);assert.ok(manifest.diagnostics.duplicateByteGroups.length);
const business=readFileSync(join(input,'business-data.json'),'utf8');
for(const r of sql.prepare('SELECT manage_token FROM jobs').all())assert.ok(!business.includes(r.manage_token));
for(const r of sql.prepare('SELECT token FROM invoice_records').all())assert.ok(!business.includes(r.token));
assert.throws(()=>restorePackage({input,target:join(root,'wrong-password'),password:'incorrect-password-that-is-long'}));assert.ok(!existsSync(join(root,'wrong-password')));
const target=join(root,'restored'),restored=restorePackage({input,target,password:pass});const fresh=new DatabaseSync(join(target,'business.sqlite'));
for(const t of tables){const before=sql.prepare(`SELECT * FROM ${t} ORDER BY rowid`).all(),after=fresh.prepare(`SELECT * FROM ${t} ORDER BY rowid`).all();if(t==='jobs')for(let i=0;i<before.length;i++){assert.notEqual(before[i].manage_token,after[i].manage_token);before[i].manage_token=after[i].manage_token}if(['invoice_records','marketing_posts'].includes(t))for(let i=0;i<before.length;i++)before[i].token=after[i].token;assert.deepEqual(after,before,t)}
assert.deepEqual(fresh.prepare('PRAGMA foreign_key_check').all(),[]);
for(const f of manifest.files)assert.equal(hash(readFileSync(join(target,'objects',hash(f.objectKey)))),f.sha256);
assert.throws(()=>restorePackage({input,target,password:pass}),/already exists/);
const bad=join(root,'tampered');cpSync(input,bad,{recursive:true});writeFileSync(join(bad,manifest.files[0].path),'tampered');assert.throws(()=>restorePackage({input:bad,target:join(root,'bad-restore'),password:pass}),/Corrupt file/);assert.ok(!existsSync(join(root,'bad-restore')));
// Corrupt/missing source references must fail closed without deleting the source.
const missingSource=join(root,'missing-source');cpSync(source,missingSource,{recursive:true});
const {unlinkSync}=await import('node:fs');unlinkSync(join(missingSource,'objects',hash(media.object_key)));
assert.throws(()=>createPackage({database:join(missingSource,'business.sqlite'),objects:join(missingSource,'objects'),migrations:resolve('drizzle'),output:join(root,'missing-package'),password:pass,offlineConfirmed:true}),/Missing/);
assert.ok(existsSync(join(source,'objects',hash(media.object_key))));
const brokenDb=new DatabaseSync(join(missingSource,'business.sqlite'));brokenDb.exec('PRAGMA foreign_keys=OFF');brokenDb.prepare('UPDATE jobs SET customer_id=? WHERE id=?').run('missing-customer',job);brokenDb.close();
assert.throws(()=>createPackage({database:join(missingSource,'business.sqlite'),objects:join(source,'objects'),migrations:resolve('drizzle'),output:join(root,'broken-package'),password:pass,offlineConfirmed:true}),/Broken relationships/);
const tamperedManifest=JSON.parse(readFileSync(join(bad,'manifest.json'),'utf8'));tamperedManifest.createdAt='altered';writeFileSync(join(bad,'manifest.json'),JSON.stringify(tamperedManifest));writeFileSync(join(bad,'COMPLETE'),hash(JSON.stringify(tamperedManifest)));
assert.throws(()=>restorePackage({input:bad,target:join(root,'forged-restore'),password:pass}),/Unauthenticated manifest/);
// Rebind ORIGINAL application handlers to the restored, on-disk SQLite and file store.
// Owner identity stub remains test-only; this is not independent authentication.
globalThis.__readinessEnv.DB={prepare(q){let values=[];return{bind(...v){values=v;return this},async first(c){const r=fresh.prepare(q).get(...values);return c?r?.[c]??null:r??null},async all(){return{results:fresh.prepare(q).all(...values)}},async raw(){return fresh.prepare(q).all(...values).map(Object.values)},async run(){throw Error('Restore verification is read-only')}}},async batch(){throw Error('Restore verification is read-only')}};
globalThis.__readinessEnv.BUCKET={async get(k){const p=join(target,'objects',hash(k));if(!existsSync(p))return null;return{body:readFileSync(p),httpMetadata:{contentType:manifest.files.find(f=>f.objectKey===k)?.type}}},async put(){throw Error('Read-only proof')},async delete(){throw Error('Read-only proof')}};
const jobs=await route('app/api/owner/bookings/route.ts'),rows=await(await jobs.GET(new Request('https://pressureup.test/jobs',{headers:owner}))).json();assert.equal(rows.length,manifest.counts.jobs);assert.ok(rows.some(r=>r.job.id===job&&r.job.customerId===sql.prepare('SELECT customer_id FROM jobs WHERE id=?').get(job).customer_id));
const photos=await route('app/api/owner/media/[id]/route.ts'),photo=await photos.GET(new Request('https://pressureup.test/photo'),{params:Promise.resolve({id:media.id})});assert.equal(photo.status,200);assert.equal(hash(Buffer.from(await photo.arrayBuffer())),hash(png));
const docs=await route('app/api/owner/documents/route.ts'),pdf=await docs.GET(new Request(`https://pressureup.test/documents?id=${job}&type=invoice`,{headers:owner}));assert.equal(pdf.status,200);const pdfBytes=Buffer.from(await pdf.arrayBuffer());const{PDFDocument}=await import('pdf-lib');assert.ok((await PDFDocument.load(pdfBytes)).getPageCount()>0);writeFileSync(join(root,'restored-invoice.pdf'),pdfBytes);
const contact=await route('app/api/contact/route.ts');assert.equal((await(await contact.GET()).json()).email,'business@example.test');
const marketing=await route('app/api/owner/marketing/route.ts');assert.equal((await(await marketing.GET(new Request('https://pressureup.test/marketing',{headers:owner}))).json()).posts.length,1);
const growth=await route('app/api/owner/growth/route.ts');const analytics=await growth.GET(new Request('https://pressureup.test/growth?from=2026-01-01&to=2026-12-31',{headers:owner}));assert.equal(analytics.status,200);assert.equal((await analytics.json()).counts.started,1);
const portal=await route('app/api/manage/[token]/document/route.ts');const old=sql.prepare('SELECT manage_token FROM jobs WHERE id=?').get(job).manage_token,newToken=fresh.prepare('SELECT manage_token FROM jobs WHERE id=?').get(job).manage_token;
assert.equal((await portal.GET(new Request('https://pressureup.test/document?type=invoice'),{params:Promise.resolve({token:old})})).status,404);assert.equal((await portal.GET(new Request('https://pressureup.test/document?type=invoice'),{params:Promise.resolve({token:newToken})})).status,200);
const proof={result:'PARTIAL',productionData:false,createdAt:new Date().toISOString(),tables:manifest.counts,files:manifest.files.length,checks:['27 populated tables restored row-for-row except explicitly rotated tokens','foreign keys valid','all referenced original/thumbnail SHA-256 bytes match','invoice revisions and cash payment preserved','receipts, expenses, mileage, analytics and website records preserved','orphan and duplicate bytes reported without deletion','business export excludes fixture access tokens including embedded history','wrong password, corrupt file, forged manifest, missing source file, broken source relationship and overwrite rejected','original application reads restored jobs, original image, settings, marketing and analytics','original application generates parseable invoice PDF','old customer link rejected; regenerated link serves correct invoice'],limitations:['Synthetic data only; no live business backup','No full browser/UI comparison','Test-only owner identity; independent authentication not implemented','No independently hosted deployment or external backup'],root};
writeFileSync(join(root,'proof.json'),JSON.stringify(proof,null,2));console.log('RECOVERY PROOF '+JSON.stringify(proof));fresh.close();
