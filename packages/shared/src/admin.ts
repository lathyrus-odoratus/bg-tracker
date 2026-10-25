import { z } from 'zod'

const optionalInt = (min: number, max: number) => z.number().int().min(min).max(max).nullable()

/** 管理頁新增／編輯遊戲（整份取代，含機制與主題） */
export const gameInputSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    /** 英文名稱；沒填就顯示 `name` */
    nameEn: z.string().trim().min(1).max(100).nullable(),
    minPlayers: optionalInt(1, 99),
    maxPlayers: optionalInt(1, 99),
    playMinutes: optionalInt(1, 10_000),
    bggId: optionalInt(1, 10_000_000),
    bgaSlug: z
      .string()
      .trim()
      .regex(/^[a-z0-9]+$/)
      .nullable(),
    /** 自訂圖片；沒填就用 BGA 的盒子圖 */
    imageUrl: z.url({ protocol: /^https$/ }).nullable(),
    mechanismIds: z.array(z.uuid()).max(50),
    themeIds: z.array(z.uuid()).max(50),
  })
  .refine((g) => g.minPlayers === null || g.maxPlayers === null || g.maxPlayers >= g.minPlayers, {
    message: '最多人數不能小於最少人數',
    path: ['maxPlayers'],
  })
export type GameInput = z.infer<typeof gameInputSchema>

export const mechanismInputSchema = z.object({
  name: z.string().trim().min(1).max(100),
  nameEn: z.string().trim().min(1).max(100).nullable(),
  description: z.string().trim().max(1000),
})
export type MechanismInput = z.infer<typeof mechanismInputSchema>

export const createdSchema = z.object({ id: z.string() })

/** `GET /api/bga/:slug`：從 BGA 取得的遊戲資料（登入的人都能查；新增／編輯遊戲時帶入） */
export const bgaLookupSchema = z.object({
  slug: z.string(),
  nameEn: z.string(),
  /** 繁體中文名稱；BGA 沒有翻譯時為 null */
  nameZh: z.string().nullable(),
  minPlayers: z.number().nullable(),
  maxPlayers: z.number().nullable(),
  bggId: z.number().nullable(),
  /** 遊戲在 BGA 上的機制、主題標籤 id（對到 `bgaTagId`） */
  mechanismTagIds: z.array(z.number()),
  themeTagIds: z.array(z.number()),
})
export type BgaLookup = z.infer<typeof bgaLookupSchema>

export const bgaSlugParamSchema = z.object({ slug: z.string().regex(/^[a-z0-9]+$/) })

/** `POST /api/games`：成員只能用 BGA 代號新增；名稱、人數、BGG id 由 server 向 BGA 查 */
export const memberGameInputSchema = z.object({
  bgaSlug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+$/),
})

/** `POST /api/admin/bga/sync`：從 BGA 目錄同步所有有代號的遊戲的機制與主題 */
export const bgaSyncResultSchema = z.object({
  /** 更新了幾款 */
  updated: z.number(),
  /** BGA 目錄裡找不到的代號（這些遊戲的機制與主題不動） */
  missing: z.array(z.string()),
})
export type BgaSyncResult = z.infer<typeof bgaSyncResultSchema>
