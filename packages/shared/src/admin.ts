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
