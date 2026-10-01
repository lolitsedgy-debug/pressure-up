export const LA_TODAY=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
export function dateKey(input:string,referenceDate=LA_TODAY()){if(/^\d{4}-\d{2}-\d{2}$/.test(input))return input;if(/[a-z]/i.test(input)&&!/[0-9]{4}/.test(input))input=input+', '+referenceDate.slice(0,4);const d=new Date(/^\d{4}-\d{2}-\d{2}T/.test(input)?input.slice(0,10)+'T12:00:00':input);return Number.isFinite(+d)?d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'):'';}
export function isBlocked(day:string,window:string,rules:any[],blocks:any[],work:any[]=[],duration=120){
 const weekday=new Date(day+'T12:00:00Z').getUTCDay();
 // Protect the arrival range plus a minimum two-hour visit: 8–11 or 12–15.
 const start=window==='morning'?480:720,end=start+60+Math.max(120,duration);
 if(end>1080)return true;
 const mins=(t:string)=>{const[h,m]=(t||'').split(':').map(Number);return h*60+m};
 const matches=(b:any)=>b.window==='all'||b.window===window||(b.window==='custom'&&((!b.start_time||!b.end_time)||mins(b.start_time)<end&&mins(b.end_time)>start));
 return rules.some(r=>r.enabled&&r.weekday===weekday&&matches(r))||blocks.some(b=>b.block_date===day&&matches(b))||work.some(j=>{if(dateKey(j.scheduled_date)!==day||j.status==='Cancelled')return false;const js=j.arrival_window.includes('12')?720:480,je=js+60+Math.max(120,Number(j.duration_minutes||120));return start<je+30&&end+30>js});
}
