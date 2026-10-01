import { requireChatGPTUser } from "../chatgpt-auth";import { OwnerShell } from "./OwnerShell";import Dashboard from './dashboard';
export const dynamic="force-dynamic";
export default async function Page(){const u=await requireChatGPTUser("/owner");return <OwnerShell><Dashboard/></OwnerShell>}
