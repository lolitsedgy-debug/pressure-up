import { env } from '@/lib/runtime-env';
import { getChatGPTUser } from "../../../../chatgpt-auth";
import { rawDb } from "../../../../../db";
const OWNER_EMAIL = process.env.PRESSURE_UP_OWNER_EMAIL || "pressureup.info@gmail.com";
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getChatGPTUser();
  if (!user || user.email.toLowerCase() !== OWNER_EMAIL.toLowerCase()) return new Response("Unauthorized", { status: 401 });
  const { id } = await context.params;
  const record = await rawDb().prepare("SELECT * FROM media WHERE id=? LIMIT 1").bind(id).first<any>();
  if (!record) return new Response("Not found", { status: 404 });
  const params = new URL(request.url).searchParams;
  const thumbnail = params.has('thumbnail');
  const objectKey = thumbnail ? (record.thumbnail_object_key || record.object_key) : record.object_key;
  const object = await env.BUCKET.get(objectKey);
  if (!object) return new Response("Not found", { status: 404 });
  return new Response(object.body, { headers: { "Content-Type": thumbnail && record.thumbnail_object_key ? 'image/jpeg' : record.content_type, "Content-Disposition": `${params.has('download')?'attachment':'inline'}; filename*=UTF-8''${encodeURIComponent(record.file_name)}`, "Cache-Control": "private, no-store", "X-Content-Type-Options":"nosniff" } });
}
