/**
 * Local development database launcher.
 *
 * The assignment requires PostgreSQL. This project normally points at any
 * standard PostgreSQL URL (Neon / Railway / Supabase / local install). For a
 * zero-config local demo we ship an embedded PostgreSQL runtime so `npm run
 * db:dev` is all that is needed to get a real Postgres instance on :5432.
 */
import EmbeddedPostgres from 'embedded-postgres';
import { existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const databaseDir = resolve(process.cwd(), '.postgres');
const port = Number(process.env.PGPORT ?? 5432);

mkdirSync(databaseDir, { recursive: true });

const pg = new EmbeddedPostgres({
  databaseDir,
  user: 'oneatlas',
  password: 'oneatlas',
  port,
  persistent: true,
});

const alreadyInitialised = existsSync(resolve(databaseDir, 'PG_VERSION'));

try {
  if (!alreadyInitialised) {
    console.log('Initialising embedded PostgreSQL cluster...');
    await pg.initialise();
  }
  await pg.start();

  const client = pg.getPgClient();
  await client.connect();
  const exists = await client.query(
    "SELECT 1 FROM pg_database WHERE datname = 'oneatlas'"
  );
  if (exists.rowCount === 0) {
    await client.query('CREATE DATABASE oneatlas');
    console.log('Created database "oneatlas".');
  }
  await client.end();

  console.log(`PostgreSQL ready on postgres://oneatlas:oneatlas@localhost:${port}/oneatlas`);
  console.log('Press Ctrl+C to stop.');

  const shutdown = async () => {
    try {
      await pg.stop();
    } finally {
      process.exit(0);
    }
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // Keep the event loop alive.
  setInterval(() => {}, 60_000);
} catch (error) {
  console.error('Failed to start PostgreSQL:', error);
  try {
    await pg.stop();
  } catch {}
  process.exit(1);
}
