import { afterAll, beforeEach } from 'vitest'
import { sql } from 'drizzle-orm'
import { createDb } from '../../src/db/client.ts'

/** 連到測試資料庫；每個測試前清空所有表，檔案結束時關閉連線 */
export function useTestDb({ truncate = true } = {}) {
  const url = process.env.TEST_DATABASE_URL
  if (!url) throw new Error('TEST_DATABASE_URL 未設定')
  const conn = createDb(url)
  if (truncate) beforeEach(() => truncateAll(conn.db))
  afterAll(() => conn.close())
  return conn.db
}

async function truncateAll(db: ReturnType<typeof createDb>['db']) {
  const rows = await db.execute<{ tablename: string }>(
    sql`SELECT tablename FROM pg_tables WHERE schemaname = 'public'`,
  )
  if (rows.length === 0) return
  const names = rows.map((r) => `"${r.tablename}"`).join(', ')
  await db.execute(sql.raw(`TRUNCATE ${names} RESTART IDENTITY CASCADE`))
}
