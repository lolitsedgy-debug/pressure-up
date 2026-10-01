import { getChatGPTUser } from "../../../chatgpt-auth";
import { rawDb } from "../../../../db";
const OWNER_EMAIL = process.env.PRESSURE_UP_OWNER_EMAIL || "pressureup.info@gmail.com";
export async function GET() {
  const user = await getChatGPTUser();
  if (!user || user.email.toLowerCase() !== OWNER_EMAIL.toLowerCase()) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const db = rawDb();
    const jobRows = (await db.prepare("SELECT * FROM jobs ORDER BY created_at DESC LIMIT 250").all<any>()).results;
    const customerRows = (await db.prepare("SELECT * FROM customers").all<any>()).results;
    const mediaRows = (await db.prepare("SELECT * FROM media").all<any>()).results;
    const customerById = new Map(customerRows.map((c:any) => [c.id, c]));
    const mediaByJob = new Map<string, any[]>();
    for (const m of mediaRows) { const list = mediaByJob.get(m.job_id) || []; list.push(m); mediaByJob.set(m.job_id, list); }
    const customerIds = new Set(jobRows.map((j:any) => j.customer_id));
    return Response.json({
      customers: customerRows.filter((c:any) => customerIds.has(c.id)).map((c:any) => ({ id:c.id,name:`${c.first_name} ${c.last_name}`.trim(),phone:c.phone,email:c.email,address:c.address,language:c.language,spent:0,consent:!!c.consent })),
      jobs: jobRows.map((j:any) => {
        const files = mediaByJob.get(j.id) || [];
        return { id:j.id,customerId:j.customer_id,serviceAddress:j.service_address,service:j.service,date:j.scheduled_date,window:j.arrival_window,price:j.price,status:j.status,payment:j.payment_method,invoice:j.invoice_json === "[]" ? "Estimate" : "Ready to send",media:files.length,mediaFiles:files.map((m:any)=>({type:"image",name:m.file_name,url:`/api/owner/media/${m.id}`})),lineItems:JSON.parse(j.estimate_json||"[]"),estimateStatus:"Ready" };
      })
    });
  } catch (error) { console.error("owner data failed", error); return Response.json({ error: "Business records are temporarily unavailable." }, { status: 500 }); }
}
