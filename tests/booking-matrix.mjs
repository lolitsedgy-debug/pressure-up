import assert from 'node:assert/strict';
import {sql,route} from './readiness.mjs';
const api=await route('app/api/bookings/route.ts'),quote=await route('app/api/quote/route.ts');
const selection={services:['driveway'],stories:'One story',patioSize:'Standard',condition:'Routine dirt',prep:'Yes, completely clear',city:'Lawndale'};
const q=await(await quote.POST(new Request('https://pressureup.test/quote',{method:'POST',body:JSON.stringify(selection)}))).json();let count=0;
for(const window of ['8–9 AM','12–1 PM'])for(const payment of ['Card after service','Cash after service'])for(const updatesOptIn of [false,true]){
 const d=new Date();d.setUTCDate(d.getUTCDate()+30+count++);const date=d.toISOString().slice(0,10);
 const payload={customer:{firstName:'Booking',lastName:'Matrix',phone:'+12025550177',email:'matrix@example.test',address:'100 Test Road, Lawndale, CA',updatesOptIn},job:{date,window,payment,price:q.price},selection};
 const send=()=>{const f=new FormData();f.set('data',JSON.stringify(payload));return api.POST(new Request('https://pressureup.test/bookings',{method:'POST',body:f}))};
 const r=await send(),result=await r.json();assert.equal(r.status,201,JSON.stringify(result));const row=sql.prepare('SELECT * FROM jobs WHERE id=?').get(result.jobId);assert.equal(row.arrival_window,window);assert.equal(row.payment_method,payment);assert.equal(row.updates_opt_in,Number(updatesOptIn));assert.equal(row.scheduled_date,date);assert.ok(sql.prepare('SELECT id FROM customers WHERE id=?').get(row.customer_id));assert.ok(sql.prepare('SELECT job_id FROM trip_jobs WHERE job_id=?').get(row.id));
 const before=sql.prepare('SELECT count(*) n FROM jobs').get().n;assert.equal((await send()).status,409);assert.equal(sql.prepare('SELECT count(*) n FROM jobs').get().n,before);
}
assert.equal(sql.prepare("SELECT count(*) n FROM customers WHERE email='matrix@example.test'").get().n,1);
console.log('PASS: all 8 window/payment/updates combinations, new/repeat customer, job/date/trip associations, immediate repeat submission rejected without duplicate. Backend only; not an iPhone reproduction.');
