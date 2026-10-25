// 本機開發用的範例資料（`pnpm db:seed`）：遊戲與機制、主題的對應。可以重複執行，已存在的會略過。
// 機制與主題本身由 migration 建立（BGA 的標籤）；這裡的對應取自 BGA（2026-10-25）
import { and, eq, inArray, isNull } from 'drizzle-orm'
import { loadDatabaseUrl } from '../src/config.ts'
import { createDb } from '../src/db/client.ts'
import { gameMechanisms, gameThemes, games, mechanisms, themes } from '../src/db/schema/index.ts'

// 只放 BGA 上有的遊戲（bga = BGA 的遊戲代號，圖片從它組出來）
const GAMES: {
  name: string
  bga: string
  min: number
  max: number
  minutes: number
  mechanisms: string[]
  themes: string[]
}[] = [
  {
    name: '農家樂',
    bga: 'agricola',
    min: 1,
    max: 4,
    minutes: 120,
    mechanisms: ['工人放置', '資源管理', '卡牌'],
    themes: ['建設'],
  },
  {
    name: '卡卡頌',
    bga: 'carcassonne',
    min: 2,
    max: 5,
    minutes: 45,
    mechanisms: ['板塊拼放'],
    themes: ['歷史'],
  },
  {
    name: '璀璨寶石',
    bga: 'splendor',
    min: 2,
    max: 4,
    minutes: 30,
    mechanisms: ['卡牌', '收集', '資源管理'],
    themes: ['歷史'],
  },
  {
    name: '七大奇蹟',
    bga: 'sevenwonders',
    min: 2,
    max: 7,
    minutes: 30,
    mechanisms: ['輪抽', '卡牌'],
    themes: ['歷史'],
  },
  {
    name: '展翅翱翔',
    bga: 'wingspan',
    min: 1,
    max: 5,
    minutes: 70,
    mechanisms: ['卡牌', '引擎構築', '目標', '手牌管理', '骰子'],
    themes: ['動物'],
  },
  {
    name: '波多黎各',
    bga: 'puertorico',
    min: 3,
    max: 5,
    minutes: 120,
    mechanisms: ['角色扮演', '資源管理'],
    themes: ['歷史', '建設'],
  },
  {
    name: '鐵道任務',
    bga: 'tickettoride',
    min: 2,
    max: 5,
    minutes: 60,
    mechanisms: ['手牌管理', '目標'],
    themes: ['鐵路', '歷史'],
  },
  {
    name: '石器時代',
    bga: 'stoneage',
    min: 2,
    max: 4,
    minutes: 90,
    mechanisms: ['工人放置', '骰子', '資源管理', '收集'],
    themes: ['歷史', '建設'],
  },
  {
    name: '殖民火星',
    bga: 'terraformingmars',
    min: 1,
    max: 5,
    minutes: 120,
    mechanisms: ['卡牌', '板塊拼放'],
    themes: ['科幻'],
  },
]

const { db, close } = createDb(loadDatabaseUrl(), { max: 1 })
await db.transaction(async (tx) => {
  await tx
    .insert(games)
    .values(
      GAMES.map((g) => ({
        name: g.name,
        minPlayers: g.min,
        maxPlayers: g.max,
        playMinutes: g.minutes,
      })),
    )
    .onConflictDoNothing()

  // 已存在的遊戲（例如之前的 seed 建的）補上 BGA 代號，不覆蓋手動改過的
  for (const g of GAMES) {
    await tx
      .update(games)
      .set({ bgaSlug: g.bga })
      .where(and(eq(games.name, g.name), isNull(games.bgaSlug)))
  }

  const gameIds = new Map(
    (
      await tx
        .select({ id: games.id, name: games.name })
        .from(games)
        .where(
          inArray(
            games.name,
            GAMES.map((g) => g.name),
          ),
        )
    ).map((r) => [r.name, r.id]),
  )
  const byName = (rows: { id: string; name: string }[]) => new Map(rows.map((r) => [r.name, r.id]))
  const mechanismIds = byName(
    await tx.select({ id: mechanisms.id, name: mechanisms.name }).from(mechanisms),
  )
  const themeIds = byName(await tx.select({ id: themes.id, name: themes.name }).from(themes))
  // admin 改過名稱的就對不到，略過
  await tx
    .insert(gameMechanisms)
    .values(
      GAMES.flatMap((g) =>
        g.mechanisms.flatMap((m) => {
          const mechanismId = mechanismIds.get(m)
          return mechanismId ? [{ gameId: gameIds.get(g.name)!, mechanismId }] : []
        }),
      ),
    )
    .onConflictDoNothing()
  await tx
    .insert(gameThemes)
    .values(
      GAMES.flatMap((g) =>
        g.themes.flatMap((t) => {
          const themeId = themeIds.get(t)
          return themeId ? [{ gameId: gameIds.get(g.name)!, themeId }] : []
        }),
      ),
    )
    .onConflictDoNothing()
})
await close()
console.log(`seeded ${GAMES.length} games`)
