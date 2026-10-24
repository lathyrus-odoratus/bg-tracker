import { z } from 'zod'

/** `GET /api/config`：前端在執行時取得的公開設定，不能放機密 */
export const publicConfigSchema = z.object({
  appUrl: z.string(),
})
export type PublicConfig = z.infer<typeof publicConfigSchema>
