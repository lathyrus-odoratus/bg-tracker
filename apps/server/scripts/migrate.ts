// 手動套用 migration（本機 `pnpm db:migrate`）。部署時由程序啟動時套用
// 只需要 DATABASE_URL
import { loadDatabaseUrl } from '../src/config.ts'
import { createDb } from '../src/db/client.ts'
import { runMigrations } from '../src/db/migrate.ts'

const { db, close } = createDb(loadDatabaseUrl(), { max: 1 })
await runMigrations(db)
await close()
console.log('migrations applied')
