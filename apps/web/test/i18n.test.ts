import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import zhTW from '../src/i18n/zh-TW.ts'
import en from '../src/i18n/en.ts'

/** 所有葉節點的 key（`a.b.c`） */
function leafKeys(obj: object, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    typeof v === 'object' && v !== null ? leafKeys(v, `${prefix}${k}.`) : [`${prefix}${k}`],
  )
}

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const path = join(dir, e.name)
    if (e.isDirectory()) return sourceFiles(path)
    return /\.(vue|ts)$/.test(e.name) ? [path] : []
  })
}

const src = join(import.meta.dirname, '../src')

describe('介面文字', () => {
  it('程式裡用到的 key 都存在（`t()`／`$t()`／`<i18n-t keypath>`；動態組出來的不檢查）', () => {
    const keys = new Set(leafKeys(zhTW))
    const used = sourceFiles(src).flatMap((file) =>
      [
        ...readFileSync(file, 'utf8').matchAll(
          /(?:\$t|\bt)\(\s*'([a-zA-Z.]+)'|keypath="([a-zA-Z.]+)"|\? '([a-z]+\.[a-zA-Z.]+)' : '([a-z]+\.[a-zA-Z.]+)'/g,
        ),
      ].flatMap((m) =>
        m
          .slice(1)
          .filter(Boolean)
          .map((key) => ({ file, key })),
      ),
    )
    expect(used.length).toBeGreaterThan(100)
    expect(used.filter((u) => !keys.has(u.key))).toEqual([])
  })

  it('英文沒有空字串（型別保證 key 一致，這裡防漏翻）', () => {
    const values = (obj: object): string[] =>
      Object.values(obj).flatMap((v) => (typeof v === 'object' ? values(v) : [v]))
    expect(values(en).filter((v) => !v.trim())).toEqual([])
    expect(leafKeys(en).sort()).toEqual(leafKeys(zhTW).sort())
  })
})
