import dotenv from 'dotenv';
import path from 'path';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { client, db } from './drizzle';
import { sql } from 'drizzle-orm';

dotenv.config();

async function main() {
  await db.execute(sql`
    CREATE EXTENSION IF NOT EXISTS pg_trgm;
  `);

  console.log('Created extension for fuzzy searching');
  await migrate(db, {
    migrationsFolder: path.join(process.cwd(), './lib/db/migrations'),
  });
  console.log(`Migrations complete`);
  await client.end();
}

main();
