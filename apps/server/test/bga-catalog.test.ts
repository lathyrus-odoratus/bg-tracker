import { describe, expect, it } from 'vitest'
import { parseCatalogEntry, parseZhName, toBgaGame } from '../src/bga/catalog.ts'

// 取自 BGA 遊戲頁內嵌目錄的格式（只留用到的欄位，加一個字串裡有大括號的干擾項）
const html = `<script>var x = {"games":[{"id":1,"name":"other","display_name_en":"Other {x}"},{"id":1131,"name":"sevenwonders","display_name_en":"7 Wonders","media":{"box":{"en":"1651658786"},"icon":{"default":"1"}},"player_numbers":[3,4,5,6,7],"bgg_id":68448,"tags":[[3,0]]},{"id":2,"name":"carcassonne"}]};</script>`

describe('BGA 遊戲頁解析', () => {
  it('從內嵌目錄取出指定遊戲', () => {
    const entry = parseCatalogEntry(html, 'sevenwonders')!
    expect(toBgaGame(entry, '七大奇蹟')).toEqual({
      slug: 'sevenwonders',
      nameEn: '7 Wonders',
      nameZh: '七大奇蹟',
      minPlayers: 3,
      maxPlayers: 7,
      bggId: 68448,
      imageUrl:
        'https://x.boardgamearena.net/data/gamemedia/sevenwonders/box/en_280.png?h=1651658786',
    })
  })

  it('找不到遊戲回傳 null；沒有圖片與人數時欄位為 null', () => {
    expect(parseCatalogEntry(html, 'nope')).toBeNull()
    const other = toBgaGame(parseCatalogEntry(html, 'other')!, null)
    expect(other).toMatchObject({
      nameEn: 'Other {x}',
      minPlayers: null,
      imageUrl: null,
      bggId: null,
    })
  })

  it('中文名稱取自 og:title', () => {
    expect(
      parseZhName('<meta property="og:title" content="在Board Game Arena上線上玩七大奇蹟" />'),
    ).toBe('七大奇蹟')
    expect(parseZhName('<meta property="og:title" content="Play 7 Wonders online" />')).toBeNull()
  })
})
