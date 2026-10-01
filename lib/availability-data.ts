import 'server-only';
import { rawDb } from '../db';
type Window = { window: string; start_time: string | null; end_time: string | null };
type Rule = Window & { id: string; enabled: boolean; weekday: number };
type Block = Window & { id: string; block_date: string };
type Job = { id: string; scheduled_date: string; arrival_window: string; status: string; duration_minutes: number };

// Shared database access belongs outside route.ts: Next route modules only
// export HTTP handlers and supported segment configuration.
export async function availabilityRows() {
  const db = rawDb();
  const [rules, blocks, jobs] = await Promise.all([
    db.prepare('SELECT * FROM availability_rules WHERE enabled=true').all<Rule>(),
    db.prepare('SELECT * FROM availability_blocks').all<Block>(),
    db.prepare("SELECT id,scheduled_date,arrival_window,status,duration_minutes FROM jobs WHERE status!='Cancelled'").all<Job>(),
  ]);
  return { rules: rules.results, blocks: blocks.results, jobs: jobs.results };
}
