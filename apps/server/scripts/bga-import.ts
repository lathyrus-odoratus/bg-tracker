// 從 BGA 補一款遊戲的資料（`pnpm bga:import <BGA 代號> [遊戲名稱]`）。
// 依名稱找資料庫裡的遊戲（沒給名稱就用 BGA 的中文名，再試英文名），找不到就新增。
// 只補空欄位：BGA 代號、BGG id、人數；已經填過的值不覆蓋。圖片從 BGA 代號組出來，不存
import { eq, sql } from 'drizzle-orm'
import { loadDatabaseUrl } from '../src/config.ts'
import { createDb } from '../src/db/client.ts'
import { games } from '../src/db/schema/index.ts'
import { fetchBgaGame } from '../src/bga/catalog.ts'

const [slug, nameArg] = process.argv.slice(2)
if (!slug) {
  console.error(
    '用法：pnpm bga:import <BGA 代號> [遊戲名稱]，例如 pnpm bga:import sevenwonders 七大奇蹟',
  )
  process.exit(1)
}

const bga = await fetchBgaGame(slug)
console.log('BGA：', bga)

const { db, close } = createDb(loadDatabaseUrl(), { max: 1 })
const candidates = [nameArg, bga.nameZh, bga.nameEn].filter((n): n is string => !!n)
let game: typeof games.$inferSelect | undefined
for (const name of candidates) {
  ;[game] = await db
    .select()
    .from(games)
    .where(eq(sql`lower(${games.name})`, name.toLowerCase()))
  if (game) break
}

if (game) {
  const [updated] = await db
    .update(games)
    .set({
      bgaSlug: bga.slug,
      bggId: game.bggId ?? bga.bggId,
      minPlayers: game.minPlayers ?? bga.minPlayers,
      maxPlayers: game.maxPlayers ?? bga.maxPlayers,
    })
    .where(eq(games.id, game.id))
    .returning()
  console.log('已更新：', updated)
} else {
  const [created] = await db
    .insert(games)
    .values({
      name: candidates[0]!,
      bgaSlug: bga.slug,
      bggId: bga.bggId,
      minPlayers: bga.minPlayers,
      maxPlayers: bga.maxPlayers,
    })
    .returning()
  console.log('已新增：', created)
}
await close()
