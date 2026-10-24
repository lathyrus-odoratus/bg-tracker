import { z } from 'zod'

export const SYSTEM_ROLES = ['admin', 'user'] as const
export const systemRoleSchema = z.enum(SYSTEM_ROLES)
export type SystemRole = z.infer<typeof systemRoleSchema>

/** `GET /api/me` */
export const meSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  avatarUrl: z.string(),
  systemRole: systemRoleSchema,
})
export type Me = z.infer<typeof meSchema>
