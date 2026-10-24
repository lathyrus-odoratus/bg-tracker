import { z } from 'zod'

/** `GET /api/config`：前端在執行時取得的公開設定，不能放機密 */
export const publicConfigSchema = z.object({
  appUrl: z.string(),
  /** 根目錄 package.json 的版本（映像檔 build 時寫入；本機為 dev） */
  version: z.string(),
  commit: z.string(),
})
export type PublicConfig = z.infer<typeof publicConfigSchema>
