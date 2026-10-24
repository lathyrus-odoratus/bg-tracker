import type { ContentfulStatusCode } from 'hono/utils/http-status'

/** 已知的業務錯誤；route 直接 throw，由錯誤 middleware 轉成統一格式 */
export class AppError extends Error {
  readonly code: string
  readonly status: ContentfulStatusCode
  readonly details: unknown
  constructor(
    code: string,
    status: ContentfulStatusCode,
    message?: string,
    details?: unknown,
    cause?: unknown,
  ) {
    super(message ?? code, { cause })
    this.code = code
    this.status = status
    this.details = details
  }
}
