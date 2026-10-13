// Applies db/migrations/*.sql to the Neon database, in filename order, once each.
//
//   pnpm db:migrate          apply pending migrations
//   pnpm db:migrate status   list applied / pending, change nothing
//
// Reads DATABASE_URL_UNPOOLED (Neon's direct connection, recommended for
// migrations) or DATABASE_URL from the environment, .env.local or .env.
// Applied files are recorded in schema_migrations with a checksum; editing an
// applied file is refused — add a new migration instead. Never prints secrets.

import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { Pool } from "@neondatabase/serverless";

for (const file of [".env.local", ".env"]) {
  // loadEnvFile never overrides variables that are already set
  if (existsSync(file)) process.loadEnvFile(file);
}

const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!url) {
  console.error("No DATABASE_URL_UNPOOLED or DATABASE_URL found (environment, .env.local or .env).");
  process.exit(1);
}

const dir = path.join(process.cwd(), "db", "migrations");
const files = readdirSync(dir)
  .filter((f) => /^\d{14}_[a-z0-9_]+\.sql$/.test(f))
  .sort();
const checksum = (text) => createHash("sha256").update(text).digest("hex");

const pool = new Pool({ connectionString: url });
const statusOnly = process.argv[2] === "status";

try {
  await pool.query(`
    create table if not exists schema_migrations (
      filename   text primary key,
      checksum   text not null,
      applied_at timestamptz not null default now()
    )`);
  const { rows } = await pool.query("select filename, checksum from schema_migrations");
  const applied = new Map(rows.map((r) => [r.filename, r.checksum]));

  let pending = 0;
  for (const file of files) {
    const sql = readFileSync(path.join(dir, file), "utf8");
    const sum = checksum(sql);
    if (applied.has(file)) {
      if (applied.get(file) !== sum) {
        throw new Error(`${file} was edited after it was applied. Revert it and add a new migration instead.`);
      }
      console.log(`  applied  ${file}`);
      continue;
    }
    pending++;
    if (statusOnly) {
      console.log(`  pending  ${file}`);
      continue;
    }
    // one transaction per file: it applies completely or not at all
    const client = await pool.connect();
    try {
      await client.query("begin");
      await client.query(sql);
      await client.query("insert into schema_migrations (filename, checksum) values ($1, $2)", [file, sum]);
      await client.query("commit");
      console.log(`  ✓ ran    ${file}`);
    } catch (error) {
      await client.query("rollback");
      throw new Error(`${file} failed and was rolled back: ${error.message}`);
    } finally {
      client.release();
    }
  }
  console.log(statusOnly ? `${pending} pending.` : pending ? `Applied ${pending} migration(s).` : "Up to date.");
} catch (error) {
  console.error(`Migration error: ${error.message}`);
  process.exitCode = 1;
} finally {
  await pool.end();
}
