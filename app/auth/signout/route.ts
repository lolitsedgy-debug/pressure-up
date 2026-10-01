import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../lib/supabase/server';
import { safeRelativeReturnPath } from '../../../lib/return-path';
export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  const url = new URL(request.url);
  const next = url.searchParams.get('return_to');
  return NextResponse.redirect(new URL(safeRelativeReturnPath(next), url.origin));
}
