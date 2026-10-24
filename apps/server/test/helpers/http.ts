import { errorResponseSchema } from '@bg-tracker/shared'

/** 取出錯誤回應的 code（格式不符時測試失敗） */
export async function errorCode(res: Response) {
  return errorResponseSchema.parse(await res.json()).error.code
}

export function jsonBody(body: unknown, headers: Record<string, string> = {}) {
  return { body: JSON.stringify(body), headers: { 'content-type': 'application/json', ...headers } }
}
