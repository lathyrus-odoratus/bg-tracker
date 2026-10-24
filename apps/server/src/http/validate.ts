import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import type { ValidationTargets } from 'hono'
import { AppError } from '../errors.ts'

/** zod 驗證；失敗時丟出 400，`details` 帶各欄位的錯誤 */
export function validate<T extends keyof ValidationTargets, S extends z.ZodType>(
  target: T,
  schema: S,
) {
  return zValidator(target, schema, (result) => {
    if (!result.success) {
      throw new AppError(
        'validation_failed',
        400,
        'Validation failed',
        z.flattenError(result.error as unknown as z.ZodError),
      )
    }
  })
}
