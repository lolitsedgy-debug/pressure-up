import 'server-only';
import postgres, { type Sql } from 'postgres';

type ChangeMeta = { changes: number };
type QueryResult<T = unknown> = { results: T[]; meta: ChangeMeta };

let client: Sql | null = null;
function sqlClient(): Sql {
  if (client) return client;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('Business records are temporarily unavailable. DATABASE_URL is not configured.');
  client = postgres(url, {
    prepare: false,
    max: 5,
    idle_timeout: 20,
    connect_timeout: 10,
  });
  return client;
}

function postgresSql(input: string): string {
  let q = input.trim();
  const insertIgnore = /^INSERT\s+OR\s+IGNORE\s+/i.test(q);
  if (insertIgnore) q = q.replace(/^INSERT\s+OR\s+IGNORE\s+/i, 'INSERT ');

  let n = 0;
  q = q.replace(/\?/g, () => `$${++n}`);

  if (insertIgnore && !/\bON\s+CONFLICT\b/i.test(q)) {
    const semi = q.endsWith(';');
    if (semi) q = q.slice(0, -1);
    q += ' ON CONFLICT DO NOTHING';
    if (semi) q += ';';
  }
  return q;
}

class PreparedStatement {
  private values: unknown[] = [];
  constructor(private query: string, private tx?: Sql) {}

  bind(...values: unknown[]) {
    const next = new PreparedStatement(this.query, this.tx);
    next.values = values;
    return next;
  }

  private async execute<T = any>() {
    const sql = this.tx ?? sqlClient();
    return await sql.unsafe<T[]>(postgresSql(this.query), this.values as any[]);
  }

  async all<T = any>(): Promise<QueryResult<T>> {
    const rows: any = await this.execute<T>();
    return { results: Array.from(rows) as T[], meta: { changes: Number(rows.count ?? rows.length ?? 0) } };
  }

  async first<T = any>(): Promise<T | null> {
    const result = await this.all<T>();
    return result.results[0] ?? null;
  }

  async run(): Promise<{ success: true; meta: ChangeMeta }> {
    const rows: any = await this.execute();
    return { success: true, meta: { changes: Number(rows.count ?? rows.length ?? 0) } };
  }
}

class PostgresCompatDb {
  constructor(private tx?: Sql) {}
  prepare(query: string) { return new PreparedStatement(query, this.tx); }

  async batch(statements: PreparedStatement[]) {
    if (this.tx) {
      const out: any[] = [];
      for (const s of statements) out.push(await (s as any).run());
      return out;
    }
    const sql = sqlClient();
    return await sql.begin(async tx => {
      const out: any[] = [];
      for (const s of statements) {
        const clone = Object.create(Object.getPrototypeOf(s));
        Object.assign(clone, s, { tx });
        out.push(await clone.run());
      }
      return out;
    });
  }
}

export function rawDb() { return new PostgresCompatDb(); }
export function getDb() { return rawDb(); }
