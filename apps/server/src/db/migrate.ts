import { fileURLToPath } from 'node:url'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import type { Db } from './client.ts'

export const migrationsFolder = fileURLToPath(new URL('../../drizzle', import.meta.url))

/** 程序啟動時、接連線之前套用 migration。已套用過的會略過 */
export async function runMigrations(db: Db) {
  await migrate(db, { migrationsFolder })
}
