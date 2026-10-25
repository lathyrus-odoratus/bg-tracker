import { z } from 'zod'

export const SYSTEM_ROLES = ['admin', 'user'] as const
export const systemRoleSchema = z.enum(SYSTEM_ROLES)
export type SystemRole = z.infer<typeof systemRoleSchema>

/** `GET /api/me` */
export const meSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  /** 目前 Discord 上的名稱（顯示名稱，沒有就用帳號名稱）；「重設為 Discord 名稱」用 */
  discordName: z.string(),
  avatarUrl: z.string(),
  systemRole: systemRoleSchema,
})
export type Me = z.infer<typeof meSchema>

/** 暱稱長度上限（以字元計，和 DB 的 CHECK 一致） */
export const DISPLAY_NAME_MAX = 50

/** `PUT /api/me/display-name`：改自己的暱稱（不用唯一） */
export const displayNameInputSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1)
    .refine((s) => [...s].length <= DISPLAY_NAME_MAX, `最多 ${DISPLAY_NAME_MAX} 個字`),
})
