import{rawDb}from'../db';
export const leadSources=['Google','Referral','Instagram','Door hanger','Repeat customer','Other','Direct','Unknown'];
export function leadSource(value:unknown){const v=String(value||'').trim().toLowerCase();return leadSources.find(s=>s.toLowerCase()===v)||({google:'Google',facebook:'Other',ig:'Instagram',doorhanger:'Door hanger',repeat:'Repeat customer'} as Record<string,string>)[v]||'Unknown'}
export function funnelId(value:unknown){return /^[a-f0-9-]{36}$/.test(String(value))?String(value):null}
export async function funnelStage(id:unknown,stage:'submitted'|'generated'|'sent'|'booked'|'completed'|'paid'){
 const key=funnelId(id);if(!key)return;await rawDb().prepare(`UPDATE estimate_funnels SET ${stage}_at=COALESCE(${stage}_at,?) WHERE id=?`).bind(new Date().toISOString(),key).run();
}
export async function jobStage(id:string,stage:'sent'|'booked'|'completed'|'paid'){const row=await rawDb().prepare('SELECT funnel_id FROM jobs WHERE id=?').bind(id).first<any>();if(row?.funnel_id)await funnelStage(row.funnel_id,stage)}
export async function attachFunnel(jobId:string,id:unknown,source:unknown){const db=rawDb(),key=funnelId(id),f=key?await db.prepare('SELECT * FROM estimate_funnels WHERE id=?').bind(key).first<any>():null,known=leadSource(source);await db.batch([db.prepare('UPDATE jobs SET lead_source=?,campaign=? WHERE id=?').bind(known!=='Unknown'?known:f?.source||'Unknown',f?.campaign||'',jobId),...(f?[db.prepare('UPDATE estimate_funnels SET job_id=?,source=? WHERE id=? AND job_id IS NULL').bind(jobId,known!=='Unknown'?known:f.source,key),db.prepare('UPDATE jobs SET funnel_id=? WHERE id=? AND EXISTS (SELECT 1 FROM estimate_funnels WHERE id=? AND job_id=?)').bind(key,jobId,key,jobId)]:[])])}
