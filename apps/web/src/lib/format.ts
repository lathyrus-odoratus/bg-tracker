import { locale, t } from '../i18n/index.ts'

/** 日期格式跟著介面語言；每種語言建一次就重複用 */
const formats = new Map<string, Intl.DateTimeFormat>()
function format(options: Intl.DateTimeFormatOptions, key: string) {
  const lang = locale.value
  const cacheKey = `${lang}:${key}`
  let f = formats.get(cacheKey)
  if (!f) {
    f = new Intl.DateTimeFormat(lang, options)
    formats.set(cacheKey, f)
  }
  return f
}

export function formatDate(iso: string) {
  return format({ year: 'numeric', month: 'numeric', day: 'numeric' }, 'date').format(new Date(iso))
}

export function formatPlayers(min: number | null, max: number | null) {
  if (min === null && max === null) return null
  if (min === max || max === null) return t('format.players', { n: min }, min!)
  if (min === null) return t('format.playersMax', { max })
  return t('format.playersRange', { min, max })
}

export function formatDateTime(iso: string) {
  return format(
    {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    },
    'datetime',
  ).format(new Date(iso))
}
