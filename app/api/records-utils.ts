export function isoDate(v:unknown):v is string { if(typeof v!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(v))return false;const d=new Date(v+"T12:00:00Z");return Number.isFinite(+d)&&d.toISOString().slice(0,10)===v; }
export const clean=(v:unknown,max=500)=>String(v??"").trim().slice(0,max);
export function moneyValue(v:unknown){const n=Number(v);if(!Number.isFinite(n)||n<0||n>1000000)throw new Error("Enter a valid amount.");return Math.round(n*100)/100;}
export function failure(e:unknown){console.error("Record request failed",e);return Response.json({error:"Could not save or load the record. Your entries have been kept; please try again."},{status:500});}
