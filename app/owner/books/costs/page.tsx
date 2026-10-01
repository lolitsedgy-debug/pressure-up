import {requireChatGPTUser} from '../../../chatgpt-auth';
import {OwnerShell} from '../../OwnerShell';
import Costs from '../client';
export default async function Page(){const u=await requireChatGPTUser('/owner/books/costs');return <OwnerShell active="Books & reports"><Costs/></OwnerShell>}
