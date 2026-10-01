import { getOwnerUser } from '../../lib/supabase/server';

const OWNER_EMAIL = process.env.PRESSURE_UP_OWNER_EMAIL || 'pressureup.info@gmail.com';
export async function ownerAuthorized(_request?: Request) {
  const user = await getOwnerUser();
  return Boolean(user?.email && user.email.toLowerCase() === OWNER_EMAIL.toLowerCase());
}
export const forbidden = () => Response.json({ error: 'Owner access required' }, { status: 403 });
