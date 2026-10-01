export function referenceMiles(t:any){return t.actual_miles??t.estimated_miles??null}
export function mileageSummary(trips:any[],legacy:any[]=[],from='0000',to='9999'){
 const rows=trips.filter(t=>t.trip_date>=from&&t.trip_date<=to&&['recorded','confirmed'].includes(t.status));
 const old=legacy.filter(t=>t.trip_date>=from&&t.trip_date<=to);
 return {rows,total:Math.round((rows.reduce((n,t)=>n+(referenceMiles(t)??0),0)+old.reduce((n,t)=>n+Number(t.miles||0),0))*10)/10,missing:rows.filter(t=>referenceMiles(t)===null).length,estimated:rows.filter(t=>t.actual_miles===null&&t.estimated_miles!==null).length,legacy:old};
}
