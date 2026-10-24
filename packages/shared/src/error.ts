import { z } from 'zod'

/** 所有 API 錯誤的回應格式 */
export const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    requestId: z.string(),
    details: z.unknown().optional(),
  }),
})
export type ErrorResponse = z.infer<typeof errorResponseSchema>
