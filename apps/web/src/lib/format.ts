const dateFormat = new Intl.DateTimeFormat('zh-TW', {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
})

export function formatDate(iso: string) {
  return dateFormat.format(new Date(iso))
}

export function formatPlayers(min: number | null, max: number | null) {
  if (min === null && max === null) return null
  if (min === max || max === null) return `${min} 人`
  if (min === null) return `最多 ${max} 人`
  return `${min}–${max} 人`
}

const dateTimeFormat = new Intl.DateTimeFormat('zh-TW', {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

export function formatDateTime(iso: string) {
  return dateTimeFormat.format(new Date(iso))
}
