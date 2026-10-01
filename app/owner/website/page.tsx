import {requireChatGPTUser} from '../../chatgpt-auth';import {OwnerShell} from '../OwnerShell';import Editor from './editor';
export const dynamic='force-dynamic';
export default async function Page(){const u=await requireChatGPTUser('/owner/website');return <OwnerShell active="Website"><Editor/></OwnerShell>}
