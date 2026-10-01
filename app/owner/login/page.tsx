import { createSupabaseServerClient } from '../../../lib/supabase/server';
import { redirect } from 'next/navigation';
import { safeRelativeReturnPath } from '../../../lib/return-path';

export default async function OwnerLogin({ searchParams }: { searchParams: Promise<{ return_to?: string; error?: string }> }) {
  const params = await searchParams;
  const returnTo = safeRelativeReturnPath(params.return_to, '/owner');
  async function login(formData: FormData) {
    'use server';
    const email = String(formData.get('email') || '').trim().toLowerCase();
    const password = String(formData.get('password') || '');
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) redirect(`/owner/login?return_to=${encodeURIComponent(returnTo)}&error=${encodeURIComponent('Check your email and password.')}`);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/owner/login?error=Sign-in%20failed.');
    const { data: admin } = await supabase.from('app_admins').select('role').eq('user_id', user.id).maybeSingle();
    if (!admin) { await supabase.auth.signOut(); redirect('/owner/login?error=This%20account%20is%20not%20authorized.'); }
    redirect(returnTo);
  }
  return <main className="min-h-screen bg-[#f8f7f2] p-6 flex items-center justify-center"><form action={login} className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-sm"><h1 className="text-2xl font-semibold">Pressure Up Owner</h1><p className="mt-2 text-sm text-zinc-600">Sign in to your private business dashboard.</p>{params.error&&<p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{params.error}</p>}<label className="mt-5 block text-sm font-medium">Email</label><input name="email" type="email" required autoComplete="email" className="mt-1 w-full rounded-xl border p-3"/><label className="mt-4 block text-sm font-medium">Password</label><input name="password" type="password" required autoComplete="current-password" className="mt-1 w-full rounded-xl border p-3"/><button className="mt-5 w-full rounded-xl bg-[#173b32] p-3 font-medium text-white">Sign in</button></form></main>;
}
