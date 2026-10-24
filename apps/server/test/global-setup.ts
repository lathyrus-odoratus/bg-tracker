import { sql } from 'drizzle-orm'
import { createDb } from '../src/db/client.ts'
import { runMigrations } from '../src/db/migrate.ts'

/** 每次跑測試前清空測試資料庫並重新套用所有 migration */
export default async function setup() {
  const url = process.env.TEST_DATABASE_URL
  if (!url) throw new Error('TEST_DATABASE_URL 未設定')
  const { db, close } = createDb(url)
  await db.execute(sql`DROP SCHEMA IF EXISTS drizzle CASCADE`)
  await db.execute(sql`DROP SCHEMA IF EXISTS public CASCADE`)
  await db.execute(sql`CREATE SCHEMA public`)
  await runMigrations(db)
  await close()
}
