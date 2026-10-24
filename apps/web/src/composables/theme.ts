import { ref, watch } from 'vue'
import { readStorage, writeStorage } from '../lib/storage.ts'

export const THEMES = ['light', 'dark', 'system'] as const
export type Theme = (typeof THEMES)[number]

/** 和 index.html 裡先套用主題的 inline script 用同一個 key */
const KEY = 'bgt:theme'

function apply(theme: Theme) {
  if (theme === 'system') delete document.documentElement.dataset.theme
  else document.documentElement.dataset.theme = theme
}

const stored = readStorage(KEY)
const theme = ref<Theme>(THEMES.find((t) => t === stored) ?? 'system')
watch(
  theme,
  (next) => {
    apply(next)
    writeStorage(KEY, next)
  },
  { immediate: true },
)

/** 淺色／深色／跟系統；存在瀏覽器 */
export function useTheme() {
  return theme
}
