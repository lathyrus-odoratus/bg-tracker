import { describe, expect, it } from 'vitest'
import rootPackage from '../../../package.json'
import { CHANGELOG } from '../src/changelog.ts'

describe('更新紀錄', () => {
  it('最新一筆的版本與根目錄 package.json 一致（發版時兩邊一起改）', () => {
    expect(CHANGELOG[0]?.version).toBe(rootPackage.version)
  })

  it('版本不重複，日期由新到舊', () => {
    const versions = CHANGELOG.map((r) => r.version)
    expect(new Set(versions).size).toBe(versions.length)
    const dates = CHANGELOG.map((r) => r.date)
    expect([...dates].sort().reverse()).toEqual(dates)
  })
})
