import { z } from 'zod'

export const idParamSchema = z.object({ id: z.uuid() })

const ref = z.object({ id: z.string(), name: z.string() })

/** `GET /api/graph`：首頁圓形圖的節點與連線（不含個人資料，匿名也能看） */
export const graphSchema = z.object({
  games: z.array(ref),
  mechanisms: z.array(ref),
  links: z.array(z.object({ gameId: z.string(), mechanismId: z.string() })),
})
export type Graph = z.infer<typeof graphSchema>

export const TOP_WISHES_DEFAULT = 10
export const topWishesQuerySchema = z.object({
  k: z.coerce.number().int().min(1).max(50).default(TOP_WISHES_DEFAULT),
})

/** `GET /api/wishes/top`：大家想玩（只算登入使用者的想玩清單，不受目前身分影響） */
export const topWishSchema = z.object({ gameId: z.string(), name: z.string(), count: z.number() })
export type TopWish = z.infer<typeof topWishSchema>

/** `GET /api/me/game-stats`：目前身分在各遊戲的狀態；沒玩過也沒想玩的遊戲不列出 */
export const myGameStatSchema = z.object({
  gameId: z.string(),
  playCount: z.number(),
  lastPlayedAt: z.string().nullable(),
  wished: z.boolean(),
})
export type MyGameStat = z.infer<typeof myGameStatSchema>

export const gameSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  minPlayers: z.number().nullable(),
  maxPlayers: z.number().nullable(),
  playMinutes: z.number().nullable(),
  bggId: z.number().nullable(),
  /** BGA 的遊戲代號；遊戲頁連到 `boardgamearena.com/gamepanel?game=<slug>` */
  bgaSlug: z.string().nullable(),
  imageUrl: z.string().nullable(),
})
export type GameSummary = z.infer<typeof gameSummarySchema>

export const gameListItemSchema = gameSummarySchema.extend({ mechanismCount: z.number() })
export type GameListItem = z.infer<typeof gameListItemSchema>

const userRef = z.object({ id: z.string(), displayName: z.string() })

/** 遊玩紀錄的參與者；BGA 名稱綁定了使用者才有 `user` */
export const playParticipantSchema = z.object({
  externalName: z.string(),
  rank: z.number().nullable(),
  score: z.number().nullable(),
  user: userRef.nullable(),
})

export const playSchema = z.object({
  id: z.string(),
  playedAt: z.string(),
  source: z.string(),
  externalId: z.string().nullable(),
  participants: z.array(playParticipantSchema),
})
export type Play = z.infer<typeof playSchema>

/** `GET /api/games/:id` */
export const gameDetailSchema = gameSummarySchema.extend({
  mechanisms: z.array(ref),
  plays: z.array(playSchema),
  wishers: z.array(userRef),
  players: z.array(userRef.extend({ playCount: z.number() })),
})
export type GameDetail = z.infer<typeof gameDetailSchema>

export const mechanismListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  gameCount: z.number(),
})
export type MechanismListItem = z.infer<typeof mechanismListItemSchema>

/** 遊戲標籤用：名稱加上組圖片需要的欄位 */
export const gameRefSchema = ref.extend({
  bgaSlug: z.string().nullable(),
  imageUrl: z.string().nullable(),
})
export type GameRef = z.infer<typeof gameRefSchema>

/** `GET /api/mechanisms/:id` */
export const mechanismDetailSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  games: z.array(gameRefSchema),
})
export type MechanismDetail = z.infer<typeof mechanismDetailSchema>
