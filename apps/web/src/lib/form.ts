import { ApiError } from './api.ts'
import { t } from '../i18n/index.ts'

/** 數字欄位：空字串 → null */
export function toIntOrNull(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === '') return null
  const n = Number(value)
  return Number.isInteger(n) ? n : NaN
}

/** 錯誤訊息：409 等業務錯誤用 server 的訊息（只有中文）；欄位驗證失敗列出欄位 */
export function errorMessage(err: unknown) {
  if (!(err instanceof ApiError)) return t('errors.saveFailed')
  if (err.code === 'validation_failed') {
    const fields = (err.details as { fieldErrors?: Record<string, string[]> })?.fieldErrors ?? {}
    const names = Object.keys(fields)
    return names.length
      ? t('errors.invalidFields', { fields: names.join(t('common.listSep')) })
      : t('errors.invalid')
  }
  return err.message
}
