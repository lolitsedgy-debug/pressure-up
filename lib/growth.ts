const day=86400000;
export function allocatedSpend(row:any,from:string,to:string){const start=Math.max(Date.parse(row.period_start+'T00:00:00Z'),Date.parse(from+'T00:00:00Z')),end=Math.min(Date.parse(row.period_end+'T00:00:00Z'),Date.parse(to+'T00:00:00Z')),days=(Date.parse(row.period_end+'T00:00:00Z')-Date.parse(row.period_start+'T00:00:00Z'))/day+1;return Math.max(0,(end-start)/day+1)/days*Number(row.amount)}
export function marketingReturn(revenue:number,spend:number,jobCosts:number){return{roas:spend>0?revenue/spend:null,roi:spend>0?(revenue-jobCosts-spend)/spend*100:null}}
