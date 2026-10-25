import { describe, expect, it } from 'vitest'
import {
  parseCatalogEntry,
  parseTagDefs,
  parseZhName,
  toBgaTags,
  toCatalogGame,
} from '../src/bga/catalog.ts'

// 取自 BGA 遊戲頁內嵌目錄的格式（只留用到的欄位，加一個字串裡有大括號的干擾項）
const html = `<script>var x = {"games":[{"id":1,"name":"other","display_name_en":"Other {x}"},{"id":1131,"name":"sevenwonders","display_name_en":"7 Wonders","media":{"box":{"en":"1651658786"},"icon":{"default":"1"}},"player_numbers":[3,4,5,6,7],"bgg_id":68448,"tags":[[1,0],[229,2],[102,3],[210,1],[20,1]]},{"id":2,"name":"carcassonne"}]};
var tags = [{"id":1,"cat":"Category","catKey":"theme","name":"Abstract games","descr":"x"},{"id":20,"cat":"","catKey":"specific","name":"Award-winning games"},{"id":102,"cat":"Theme","catKey":"theme","name":"Historical"},{"id":113,"cat":"Theme","catKey":"theme","name":"Surreal\\/Silly"},{"id":210,"cat":"Mechanism","catKey":"mechanism","name":"Collection"},{"id":229,"cat":"Mechanism","catKey":"mechanism","name":"Drafting"}];</script>`
const zhHtml = `{"id":102,"cat":"\\u4e3b\\u984c","catKey":"theme","name":"\\u6b77\\u53f2"},{"id":229,"cat":"\\u6a5f\\u5236","catKey":"mechanism","name":"\\u8f2a\\u62bd"}`
const tags = toBgaTags(parseTagDefs(html), parseTagDefs(zhHtml))

describe('BGA 遊戲頁解析', () => {
  it('從內嵌目錄取出指定遊戲', () => {
    const entry = parseCatalogEntry(html, 'sevenwonders')!
    expect(toCatalogGame(entry, tags)).toEqual({
      slug: 'sevenwonders',
      nameEn: '7 Wonders',
      minPlayers: 3,
      maxPlayers: 7,
      bggId: 68448,
      imageUrl:
        'https://x.boardgamearena.net/data/gamemedia/sevenwonders/box/en_280.png?h=1651658786',
      // 依 BGA 的排序；Category、specific 的標籤不算
      mechanisms: [
        { tagId: 210, nameEn: 'Collection', nameZh: null },
        { tagId: 229, nameEn: 'Drafting', nameZh: '輪抽' },
      ],
      themes: [{ tagId: 102, nameEn: 'Historical', nameZh: '歷史' }],
    })
  })

  it('找不到遊戲回傳 null；沒有圖片與人數時欄位為 null', () => {
    expect(parseCatalogEntry(html, 'nope')).toBeNull()
    const other = toCatalogGame(parseCatalogEntry(html, 'other')!, tags)
    expect(other).toMatchObject({
      nameEn: 'Other {x}',
      minPlayers: null,
      imageUrl: null,
      bggId: null,
      mechanisms: [],
      themes: [],
    })
  })

  it('全站標籤：機制與主題（不含 Abstract games 這種 Category），名稱解開跳脫字元', () => {
    expect(tags.mechanisms.map((t) => t.nameEn)).toEqual(['Collection', 'Drafting'])
    expect(tags.themes).toEqual([
      { tagId: 102, nameEn: 'Historical', nameZh: '歷史' },
      { tagId: 113, nameEn: 'Surreal/Silly', nameZh: null },
    ])
  })

  it('中文名稱取自 og:title', () => {
    expect(
      parseZhName('<meta property="og:title" content="在Board Game Arena上線上玩七大奇蹟" />'),
    ).toBe('七大奇蹟')
    expect(parseZhName('<meta property="og:title" content="Play 7 Wonders online" />')).toBeNull()
  })
})
