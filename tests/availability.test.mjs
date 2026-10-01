import test from 'node:test';import assert from 'node:assert/strict';
import {isBlocked,dateKey} from '../lib/availability.ts';
test('weekly day blocks apply beyond the currently visible calendar',()=>{
 const rules=[{weekday:1,window:'all',enabled:1}];assert.equal(isBlocked('2026-10-05','morning',rules,[]),true);assert.equal(isBlocked('2026-10-06','morning',rules,[]),false);
});
test('10–12 errands block morning but leave the noon arrival available',()=>{
 const blocks=[{block_date:'2026-10-05',window:'custom',start_time:'10:00',end_time:'12:00'}];assert.equal(isBlocked('2026-10-05','morning',[],blocks),true);assert.equal(isBlocked('2026-10-05','afternoon',[],blocks),false);
});
test('recurring custom hours use the same overlap rules',()=>{
 const rules=[{weekday:1,window:'custom',enabled:1,start_time:'13:00',end_time:'14:00'}];assert.equal(isBlocked('2026-10-05','morning',rules,[]),false);assert.equal(isBlocked('2026-10-05','afternoon',rules,[]),true);
});
test('cancelled jobs free the window while pending requests reserve it',()=>{
 const job={scheduled_date:'2026-10-05',arrival_window:'8–9 AM',status:'Requested'};assert.equal(isBlocked('2026-10-05','morning',[],[],[job]),true);assert.equal(isBlocked('2026-10-05','afternoon',[],[],[job]),false);assert.equal(isBlocked('2026-10-05','morning',[],[],[{...job,status:'Cancelled'}]),false);
});
test('old date labels and new ISO dates resolve to the same calendar day',()=>{assert.equal(dateKey('Monday, September 14, 2026'),'2026-09-14');assert.equal(dateKey('2026-09-14'),'2026-09-14')});
