import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync('public/legacy/app.js','utf8').split('\n').find(l=>l.startsWith("document.getElementById('bookingForm').onsubmit="));
async function scenario(response){
 const form=new FormData();for(const [k,v]of Object.entries({firstName:'Test',lastName:'Customer',phone:'2025550177',email:'test@example.test',address:'Test address',payment:'cash'}))form.set(k,v);
 const button={disabled:false},nodes=new Map(),state={photos:1,photoData:[{file:new Blob(['original'],{type:'image/png'}),name:'test.png'}],price:120,date:'2026-10-10',window:'8–9 AM',services:['driveway']};let calls=0,shown='',notice='';let release;
 const pending=new Promise(r=>release=r),ctx={state,FormData:class extends FormData{constructor(input){super();if(input)for(const [k,v]of input.entries())this.set(k,v)}},serviceName:()=> 'Driveway',outsideArea:()=>false,window:{},fetch:async()=>{calls++;await pending;return response},show:s=>shown=s,toast:s=>notice=s,refreshCustomerCalendar:()=>{},document:{getElementById(id){if(!nodes.has(id))nodes.set(id,{});return nodes.get(id)}}};
 vm.runInNewContext(source,ctx);const submit=nodes.get('bookingForm').onsubmit;form.querySelector=()=>button;const event={preventDefault(){},target:form};const first=submit(event);await submit(event);assert.equal(button.disabled,true);release();await first;assert.equal(calls,1);assert.equal(button.disabled,false);return {shown,notice,state,submit,event,calls:()=>calls};
}
const good=await scenario(new Response(JSON.stringify({ok:true,jobId:'test-job',manageUrl:'/manage/test'}),{status:201}));assert.equal(good.shown,'confirmation');await good.submit(good.event);assert.equal(good.calls(),1);
for(const response of [new Response('Payload Too Large',{status:413}),new Response('<html>Bad gateway</html>',{status:502}),new Response('not JSON',{status:200})]){const r=await scenario(response);assert.notEqual(r.notice,'');assert.ok(!/Unexpected|expected pattern|SyntaxError|Bad gateway|not JSON/.test(r.notice));assert.equal(r.shown,'');assert.equal(r.state.bookingSaved,undefined)}
console.log('PASS: actual submit handler suppresses concurrent double taps, shows confirmation, prevents repeat after success, and gives friendly errors for plain-text 413, HTML 502 and malformed success JSON.');
