/**
 * Self-hosted production entrypoint.
 *
 * Boots the app with either an external PostgreSQL URL (Neon, Railway,
 * Supabase, ...) or, when DATABASE_URL is local/unset, an embedded PostgreSQL
 * instance. The schema is applied and the catalogue is seeded on first boot so
 * a free-tier host with an ephemeral filesystem still serves a complete app.
 */
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const LOCAL_URL = 'postgresql://oneatlas:oneatlas@localhost:5432/oneatlas';
const databaseUrl = process.env.DATABASE_URL || LOCAL_URL;
process.env.DATABASE_URL = databaseUrl;
process.env.NODE_ENV ??= 'production';

const isLocal = /@(localhost|127\.0\.0\.1|\[::1\])[:/]/test(databaseUrl);
let pg = null;

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit', env: process.env });
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed (${result.status})`);
}

if (isLocal) {
  const { default: EmbeddedPostgres } = await import('embedded-postgres');
  const databaseDir = resolve(process.cwd(), '.postgres');
  mkdirSync(databaseDir, { recursive: true });

  pg = new EmbeddedPostgres({
    databaseDir,
    user: 'oneatlas',
    password: 'oneatlas',
    port: Number(process.env.PGPORT ?? 5432),
    persistent: true,
  });

  if (!existsSync(resolve(databaseDir, 'PG_VERSION'))) await pg.initialise();
  await pg.start();

  const client = pg.getPgClient();
  await client.connect();
  const exists = await client.query("SELECT 1 FROM pg_database WHERE datname = 'oneatlas'");
  if (exists.rowCount === 0) await client.query('CREATE DATABASE oneatlas');
  await client.end();
  console.log('[self-host] Embedded PostgreSQL ready.');
} else {
  console.log('[self-host] Using external PostgreSQL.');
}

// Apply the Prisma schema, then seed only when the catalogue is empty.
run('npx', ['prisma', 'db', 'push', '--skip-generate']);

const { PrismaClient } = await import('@prisma/client');
const prisma = new PrismaClient();
const count = await prisma.model.count();
await prisma.$disconnect();
if (count === 0) {
  console.log('[self-host] Empty catalogue — seeding...');
  run('npx', ['tsx', 'prisma/seed.ts']);
} else {
  console.log(`[self-host] Catalogue already populated (${count} models).`);
}

const server = spawn('npx', ['next', 'start'], { stdio: 'inherit', env: process.env });

async function shutdown() {
  server.kill('SIGTERM');
  try {
    await pg?.stop();
  } catch {}
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
server.on('exit', async (code) => {
  try {
    await pg?.stop();
  } catch {}
  process.exit(code ?? 0);
});
