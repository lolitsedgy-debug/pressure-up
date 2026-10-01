import test from 'node:test';import assert from 'node:assert/strict';
import {build} from 'esbuild';import{mkdtempSync}from'node:fs';import{tmpdir}from'node:os';import{join}from'node:path';const bundle=join(mkdtempSync(join(tmpdir(),'pu-quote-')),'quote.mjs');await build({entryPoints:['lib/quote.ts'],bundle:true,format:'esm',platform:'node',outfile:bundle});const {calculateQuote}=await import(bundle);
import {isBlocked} from '../lib/availability.ts';
import {mileageSummary,referenceMiles} from '../lib/mileage-summary.ts';
test('whole-property pricing and same-visit discount use owner prices',()=>{
 assert.equal(calculateQuote({services:['whole'],stories:'One story',city:'Lawndale'}).price,450);
 assert.equal(calculateQuote({services:['whole'],stories:'Two stories',city:'Lawndale'}).price,550);
 assert.equal(calculateQuote({services:['driveway','patio'],patioSize:'Large',city:'Lawndale'}).price,300);
 assert.equal(calculateQuote({services:['driveway'],price:1,city:'Lawndale'}).price,120);
 assert.throws(()=>calculateQuote({services:['unrecognized']}));
});
test('long jobs reserve overlapping windows and cannot end after six',()=>{
 const job={scheduled_date:'2026-10-05',arrival_window:'8–9 AM',status:'Requested',duration_minutes:300};
 assert.equal(isBlocked('2026-10-05','afternoon',[],[],[job]),true);
 assert.equal(isBlocked('2026-10-05','afternoon',[],[],[],360),true);
 assert.equal(isBlocked('2026-10-05','afternoon',[],[],[{...job,status:'Cancelled'}]),false);
});
test('reference totals include completed maps estimates and edits once, excluding planned and missing trips',()=>{
 const rows=[{id:'shared-trip',trip_date:'2026-09-01',status:'recorded',estimated_miles:12.4,actual_miles:null},{id:'edited',trip_date:'2026-09-02',status:'recorded',estimated_miles:8,actual_miles:10.2},{id:'planned',trip_date:'2026-09-03',status:'draft',estimated_miles:30,actual_miles:null},{id:'missing',trip_date:'2026-09-04',status:'recorded',estimated_miles:null,actual_miles:null}];
 const s=mileageSummary(rows,[],'2026-09-01','2026-09-30');assert.equal(s.total,22.6);assert.equal(s.missing,1);assert.equal(s.estimated,1);assert.equal(referenceMiles(rows[1]),10.2);
 assert.equal(mileageSummary(rows,[],'2026-10-01','2026-10-31').total,0);
});
