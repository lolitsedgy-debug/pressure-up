import {requireChatGPTUser} from '../../chatgpt-auth';import {OwnerShell} from '../OwnerShell';import Marketing from './client';
export const dynamic='force-dynamic';export default async function Page(){const u=await requireChatGPTUser('/owner/marketing');return <OwnerShell active="Marketing"><Marketing/></OwnerShell>}
