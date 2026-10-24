import { hc } from 'hono/client'
import type { ApiType } from '@bg-tracker/server'
import { errorResponseSchema } from '@bg-tracker/shared'

/** API 錯誤，統一成 server 的錯誤格式 */
export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly requestId: string | undefined
  readonly details: unknown
  constructor(
    status: number,
    code: string,
    message: string,
    requestId?: string,
    details?: unknown,
  ) {
    super(message)
    this.status = status
    this.code = code
    this.requestId = requestId
    this.details = details
  }
}

interface ApiHooks {
  /** 收到 401 時呼叫 */
  onUnauthorized: () => Promise<void>
}

let hooks: ApiHooks = { onUnauthorized: async () => {} }

export function configureApi(next: Partial<ApiHooks>) {
  hooks = { ...hooks, ...next }
}

export const apiFetch: typeof fetch = async (input, init) => {
  const res = await fetch(input, { ...init, credentials: 'same-origin' })
  if (res.status === 401) await hooks.onUnauthorized()
  return res
}

export const api = hc<ApiType>('/api', { fetch: apiFetch })

export async function toApiError(res: Response): Promise<ApiError> {
  try {
    const { error } = errorResponseSchema.parse(await res.json())
    return new ApiError(res.status, error.code, error.message, error.requestId, error.details)
  } catch {
    return new ApiError(res.status, 'http_error', `HTTP ${res.status}`)
  }
}

/** 成功時回傳 JSON，失敗時丟出 ApiError */
export async function unwrap<T>(
  request: Promise<{ ok: boolean; status: number; json(): Promise<T> }>,
): Promise<T> {
  const res = await request
  if (!res.ok) throw await toApiError(res as unknown as Response)
  return res.json()
}

/** 沒有回應內容的請求（例如 DELETE 回 204）；失敗時丟出 ApiError */
export async function ensureOk(request: Promise<{ ok: boolean; status: number }>): Promise<void> {
  const res = await request
  if (!res.ok) throw await toApiError(res as unknown as Response)
}
