import { describe, expect, it } from 'vitest'
import zhTW from '../src/i18n/zh-TW.ts'
import { HELP_MODULES, HELP_PAGES } from '../src/help/registry.ts'

describe('使用說明的目錄', () => {
  // 側欄與標題的 key 是組出來的（`help.pages.${module}.${id}.title`），i18n.test.ts 檢查不到
  it('每個模組、每一篇都有標題', () => {
    const modules = zhTW.help.modules as Record<string, string>
    const pages = zhTW.help.pages as Record<string, Record<string, { title?: string }>>
    expect(HELP_MODULES.filter((m) => !modules[m.id]).map((m) => m.id)).toEqual([])
    expect(
      HELP_PAGES.filter((p) => !pages[p.module]?.[p.id]?.title).map((p) => `${p.module}/${p.id}`),
    ).toEqual([])
  })

  it('篇章路徑不重複，第一篇是 /help 導過去的 start/welcome', () => {
    const paths = HELP_PAGES.map((p) => `${p.module}/${p.id}`)
    expect(new Set(paths).size).toBe(paths.length)
    expect(paths[0]).toBe('start/welcome')
  })
})
