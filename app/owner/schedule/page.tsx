import { requireChatGPTUser } from "../../chatgpt-auth";import { OwnerShell } from "../OwnerShell";import ScheduleClient from "./schedule-client";
export const dynamic="force-dynamic";export default async function Page(){const u=await requireChatGPTUser("/owner/schedule");return <OwnerShell active="Schedule"><ScheduleClient/></OwnerShell>}
