// 本機開發用的範例資料（`pnpm db:seed`）：遊戲、機制與對應。可以重複執行，已存在的會略過
import { and, eq, inArray, isNull } from 'drizzle-orm'
import { loadDatabaseUrl } from '../src/config.ts'
import { createDb } from '../src/db/client.ts'
import { gameMechanisms, games, mechanisms } from '../src/db/schema/index.ts'

const MECHANISMS: Record<string, string> = {
  工人放置: '輪流把工人放到行動格上執行行動，被佔走的格子別人就不能用',
  資源轉換: '把一種資源換成另一種資源或分數',
  牌庫構築: '遊戲中買牌加入自己的牌庫，逐步改良牌庫',
  板塊拼放: '抽板塊放到版圖上，和相鄰的板塊接合',
  區域控制: '在各區域比拚影響力，多數者得分',
  拍賣競標: '出價競爭物品或行動',
  手牌管理: '決定何時打出、保留或棄掉手上的牌',
  引擎構築: '早期投資換取之後越來越強的回合收益',
  集合收集: '收集特定組合的卡牌或物件來得分',
  輪抽: '每人從一手牌中選一張後把剩下的傳給下家',
  角色選擇: '每輪選擇一個角色，取得它的行動或特權',
  路線建造: '在地圖上連接城市或地點',
}

// 只放 BGA 上有的遊戲（bga = BGA 的遊戲代號，圖片從它組出來）
const GAMES: {
  name: string
  bga: string
  min: number
  max: number
  minutes: number
  mechanisms: string[]
}[] = [
  {
    name: '農家樂',
    bga: 'agricola',
    min: 1,
    max: 4,
    minutes: 120,
    mechanisms: ['工人放置', '資源轉換', '手牌管理'],
  },
  {
    name: '卡卡頌',
    bga: 'carcassonne',
    min: 2,
    max: 5,
    minutes: 45,
    mechanisms: ['板塊拼放', '區域控制'],
  },
  {
    name: '璀璨寶石',
    bga: 'splendor',
    min: 2,
    max: 4,
    minutes: 30,
    mechanisms: ['引擎構築', '集合收集'],
  },
  {
    name: '七大奇蹟',
    bga: 'sevenwonders',
    min: 2,
    max: 7,
    minutes: 30,
    mechanisms: ['輪抽', '集合收集', '引擎構築'],
  },
  {
    name: '展翅翱翔',
    bga: 'wingspan',
    min: 1,
    max: 5,
    minutes: 70,
    mechanisms: ['引擎構築', '手牌管理', '資源轉換'],
  },
  {
    name: '波多黎各',
    bga: 'puertorico',
    min: 3,
    max: 5,
    minutes: 120,
    mechanisms: ['角色選擇', '資源轉換'],
  },
  {
    name: '鐵道任務',
    bga: 'tickettoride',
    min: 2,
    max: 5,
    minutes: 60,
    mechanisms: ['路線建造', '集合收集', '手牌管理'],
  },
  {
    name: '石器時代',
    bga: 'stoneage',
    min: 2,
    max: 4,
    minutes: 90,
    mechanisms: ['工人放置', '資源轉換'],
  },
  {
    name: '殖民火星',
    bga: 'terraformingmars',
    min: 1,
    max: 5,
    minutes: 120,
    mechanisms: ['引擎構築', '輪抽', '手牌管理'],
  },
]

const { db, close } = createDb(loadDatabaseUrl(), { max: 1 })
await db.transaction(async (tx) => {
  await tx
    .insert(mechanisms)
    .values(Object.entries(MECHANISMS).map(([name, description]) => ({ name, description })))
    .onConflictDoNothing()
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
  const mechanismIds = new Map(
    (await tx.select({ id: mechanisms.id, name: mechanisms.name }).from(mechanisms)).map((r) => [
      r.name,
      r.id,
    ]),
  )
  await tx
    .insert(gameMechanisms)
    .values(
      GAMES.flatMap((g) =>
        g.mechanisms.map((m) => ({
          gameId: gameIds.get(g.name)!,
          mechanismId: mechanismIds.get(m)!,
        })),
      ),
    )
    .onConflictDoNothing()
})
await close()
console.log(`seeded ${GAMES.length} games, ${Object.keys(MECHANISMS).length} mechanisms`)
