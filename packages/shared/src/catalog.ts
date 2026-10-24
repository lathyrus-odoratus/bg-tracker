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

/**
 * `GET /api/me/game-stats`：目前身分在各遊戲的狀態；沒玩過、沒標記的遊戲不列出。
 * `playCount`／`lastPlayedAt` 只從遊玩紀錄算；`played` = 有紀錄或自己標了玩過
 */
export const myGameStatSchema = z.object({
  gameId: z.string(),
  playCount: z.number(),
  lastPlayedAt: z.string().nullable(),
  played: z.boolean(),
  /** 自己標了玩過（可以取消；有遊玩紀錄的不受影響） */
  markedPlayed: z.boolean(),
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

export const WEIGHT_MIN = 1
export const WEIGHT_MAX = 9.9
export const WEIGHT_STEP = 0.1

/** `PUT /api/me/weights/:id`：重度 1.0–9.9、間距 0.1 */
export const weightInputSchema = z.object({
  weight: z
    .number()
    .min(WEIGHT_MIN)
    .max(WEIGHT_MAX)
    .refine((w) => Math.abs(w * 10 - Math.round(w * 10)) < 1e-6, '間距是 0.1'),
})

/** 遊戲的重度：大家的平均（小數一位）、評分人數、我的評分 */
export const weightSummarySchema = z.object({
  average: z.number().nullable(),
  count: z.number(),
  mine: z.number().nullable(),
})
export type WeightSummary = z.infer<typeof weightSummarySchema>

/** `GET /api/games/:id` */
export const gameDetailSchema = gameSummarySchema.extend({
  mechanisms: z.array(ref),
  plays: z.array(playSchema),
  wishers: z.array(userRef),
  /** 玩過的人：有遊玩紀錄或自己標了玩過；只有標記的 playCount 是 0 */
  players: z.array(userRef.extend({ playCount: z.number() })),
  weight: weightSummarySchema,
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
