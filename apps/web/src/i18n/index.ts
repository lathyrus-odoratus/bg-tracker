import { watch } from 'vue'
import { createI18n } from 'vue-i18n'
import { readStorage, writeStorage } from '../lib/storage.ts'
import zhTW from './zh-TW.ts'
import en from './en.ts'

export const LOCALES = ['zh-TW', 'en'] as const
export type Locale = (typeof LOCALES)[number]
/** `en` 要符合這個型別（key 一致）；用到的 key 是否存在由 test/i18n.test.ts 檢查 */
export type MessageSchema = typeof zhTW

const KEY = 'bgt:locale'

/** 選過就用選的；沒選過時瀏覽器偏好有中文就用中文，否則英文 */
function initialLocale(): Locale {
  const stored = readStorage(KEY)
  const found = LOCALES.find((l) => l === stored)
  if (found) return found
  return navigator.languages.some((l) => l.toLowerCase().startsWith('zh')) ? 'zh-TW' : 'en'
}

export const i18n = createI18n<[MessageSchema], Locale, false>({
  legacy: false,
  locale: initialLocale(),
  fallbackLocale: 'zh-TW',
  messages: { 'zh-TW': zhTW, en },
})

export const locale = i18n.global.locale
export const t = i18n.global.t

watch(
  locale,
  (next) => {
    writeStorage(KEY, next)
    document.documentElement.lang = next === 'zh-TW' ? 'zh-Hant' : 'en'
    document.title = t('app.title')
  },
  { immediate: true },
)

/** 資料的名稱（遊戲、機制、主題）：英文介面用 `nameEn`，沒有就用 `name` */
export function localName(item: { name: string; nameEn: string | null }) {
  return locale.value === 'en' ? (item.nameEn ?? item.name) : item.name
}

/** 依目前語言的名稱排序 */
export function byLocalName(a: { name: string; nameEn: string | null }, b: typeof a) {
  return localName(a).localeCompare(localName(b), locale.value === 'en' ? 'en' : 'zh-Hant')
}
