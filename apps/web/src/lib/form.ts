import { ApiError } from './api.ts'

/** 數字欄位：空字串 → null */
export function toIntOrNull(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === '') return null
  const n = Number(value)
  return Number.isInteger(n) ? n : NaN
}

/** 錯誤訊息：409 等業務錯誤用 server 的訊息；欄位驗證失敗列出欄位 */
export function errorMessage(err: unknown) {
  if (!(err instanceof ApiError)) return '儲存失敗，請稍後再試'
  if (err.code === 'validation_failed') {
    const fields = (err.details as { fieldErrors?: Record<string, string[]> })?.fieldErrors ?? {}
    const names = Object.keys(fields)
    return names.length ? `這些欄位格式不對：${names.join('、')}` : '欄位格式不對'
  }
  return err.message
}
