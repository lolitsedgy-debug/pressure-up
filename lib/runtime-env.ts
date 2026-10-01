import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let admin: SupabaseClient | null = null;
function storageClient() {
  if (admin) return admin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('File storage is temporarily unavailable. Supabase server credentials are not configured.');
  admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return admin;
}

function bucketName() { return process.env.SUPABASE_STORAGE_BUCKET || 'pressure-up-files'; }

const BUCKET = {
  async put(key: string, body: ArrayBuffer | Uint8Array | Blob, options?: { httpMetadata?: { contentType?: string } }) {
    let payload: Blob;
    if (body instanceof Blob) payload = body;
    else if (body instanceof ArrayBuffer) payload = new Blob([body], { type: options?.httpMetadata?.contentType });
    else {
      const copy = new Uint8Array(body.byteLength);
      copy.set(body);
      payload = new Blob([copy.buffer], { type: options?.httpMetadata?.contentType });
    }
    const { error } = await storageClient().storage.from(bucketName()).upload(key, payload, {
      contentType: options?.httpMetadata?.contentType,
      upsert: false,
      cacheControl: '3600',
    });
    if (error) throw error;
  },
  async get(key: string) {
    const { data, error } = await storageClient().storage.from(bucketName()).download(key);
    if (error || !data) return null;
    return {
      body: data.stream(),
      size: data.size,
      httpMetadata: { contentType: data.type || 'application/octet-stream' },
    };
  },
  async delete(...keys: string[]) {
    const flat = keys.flat().filter(Boolean);
    if (!flat.length) return;
    const { error } = await storageClient().storage.from(bucketName()).remove(flat);
    if (error) throw error;
  },
};

type RuntimeEnv = { BUCKET: typeof BUCKET } & {
  [K in 'BUSINESS_BASE_ADDRESS' | 'BUSINESS_PHONE' | 'OWNER_EMAIL' | 'SITE_URL' |
    'GOOGLE_MAPS_API_KEY' | 'TWILIO_ACCOUNT_SID' | 'TWILIO_AUTH_TOKEN' |
    'TWILIO_FROM_NUMBER' | 'RESEND_API_KEY' | 'EMAIL_FROM']?: string;
};

export const env: RuntimeEnv = new Proxy<RuntimeEnv>({ BUCKET }, {
  get(target, property: string | symbol) {
    if (property === 'BUCKET') return BUCKET;
    if (typeof property === 'string') return process.env[property];
    return Reflect.get(target, property);
  },
});
