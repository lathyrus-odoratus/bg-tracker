import { z } from 'zod'

const optionalInt = (min: number, max: number) => z.number().int().min(min).max(max).nullable()

/** 管理頁新增／編輯遊戲（整份取代，含機制） */
export const gameInputSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
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
  })
  .refine((g) => g.minPlayers === null || g.maxPlayers === null || g.maxPlayers >= g.minPlayers, {
    message: '最多人數不能小於最少人數',
    path: ['maxPlayers'],
  })
export type GameInput = z.infer<typeof gameInputSchema>

export const mechanismInputSchema = z.object({
  name: z.string().trim().min(1).max(100),
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
