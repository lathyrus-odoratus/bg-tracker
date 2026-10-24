import { AppError } from '../errors.ts'

/**
 * 從 BGA 的遊戲頁取出遊戲資料。BGA 沒有公開 API：
 * - 英文頁（`en.`）內嵌全站遊戲目錄的 JSON，每款一個物件（`"name":"<slug>"`）
 * - 中文頁（`zh.`，繁體）的 og:title 是「在Board Game Arena上線上玩<中文名>」
 * 只在管理員手動匯入時呼叫，結果存進資料庫，不在瀏覽時打 BGA。
 */

export interface BgaGame {
  slug: string
  nameEn: string
  /** 繁體中文名稱；頁面沒有翻譯時為 null */
  nameZh: string | null
  minPlayers: number | null
  maxPlayers: number | null
  bggId: number | null
  /** 盒子圖（280px 寬） */
  imageUrl: string | null
}

const MEDIA = 'https://x.boardgamearena.net/data/gamemedia'
const SLUG_RE = /^[a-z0-9]+$/

export function gamePanelUrl(slug: string, lang = 'en') {
  return `https://${lang}.boardgamearena.com/gamepanel?game=${slug}`
}

interface CatalogEntry {
  name: string
  display_name_en: string
  player_numbers?: number[]
  bgg_id?: number
  media?: { box?: Record<string, string> }
}

/** 找到 `"name":"<slug>"` 所在的物件，用括號配對切出來再 JSON.parse */
export function parseCatalogEntry(html: string, slug: string): CatalogEntry | null {
  const at = html.indexOf(`"name":"${slug}"`)
  if (at < 0) return null
  const start = html.lastIndexOf('{"id"', at)
  if (start < 0) return null
  let depth = 0
  let inString = false
  for (let i = start; i < html.length; i++) {
    const ch = html[i]
    if (inString) {
      if (ch === '\\') i++
      else if (ch === '"') inString = false
    } else if (ch === '"') inString = true
    else if (ch === '{') depth++
    else if (ch === '}' && --depth === 0) {
      try {
        return JSON.parse(html.slice(start, i + 1)) as CatalogEntry
      } catch {
        return null
      }
    }
  }
  return null
}

export function parseZhName(html: string): string | null {
  const title = html.match(/<meta property="og:title" content="([^"]*)"/)?.[1]
  const name = title?.match(/^在Board Game Arena上線上玩(.+)$/)?.[1]?.trim()
  return name || null
}

export function toBgaGame(entry: CatalogEntry, nameZh: string | null): BgaGame {
  const players = entry.player_numbers ?? []
  // 盒子圖有多種語言時優先用英文；`?h=` 是 BGA 的版本號，換圖時會變
  const boxLang = entry.media?.box?.en ? 'en' : Object.keys(entry.media?.box ?? {})[0]
  const boxVersion = boxLang && entry.media?.box?.[boxLang]
  return {
    slug: entry.name,
    nameEn: entry.display_name_en,
    nameZh,
    minPlayers: players.length ? Math.min(...players) : null,
    maxPlayers: players.length ? Math.max(...players) : null,
    bggId: entry.bgg_id || null,
    imageUrl: boxLang
      ? `${MEDIA}/${entry.name}/box/${boxLang}_280.png${boxVersion ? `?h=${boxVersion}` : ''}`
      : null,
  }
}

async function fetchPage(url: string) {
  const res = await fetch(url, {
    headers: { 'user-agent': 'bg-tracker (personal board game group site)' },
    signal: AbortSignal.timeout(20_000),
  })
  return { ok: res.ok, status: res.status, text: await res.text() }
}

async function fetchOk(url: string) {
  const page = await fetchPage(url)
  if (!page.ok) throw new Error(`GET ${url} → ${page.status}`)
  return page.text
}

/** 遊戲列表頁也內嵌全站目錄；用來確認一個代號在 BGA 上存不存在 */
const GAME_LIST_URL = 'https://en.boardgamearena.com/gamelist'

/** BGA 沒有這個代號時回傳 null；網路或 BGA 本身的錯誤照常丟出 */
async function lookupBgaGame(slug: string): Promise<BgaGame | null> {
  if (!SLUG_RE.test(slug)) return null
  const panel = await fetchPage(gamePanelUrl(slug))
  if (!panel.ok) {
    // BGA 對不存在的遊戲回 500，和 BGA 真的出錯分不出來：查目錄，不在目錄裡才算找不到
    if (!parseCatalogEntry(await fetchOk(GAME_LIST_URL), slug)) return null
    throw new Error(`GET ${gamePanelUrl(slug)} → ${panel.status}`)
  }
  const entry = parseCatalogEntry(panel.text, slug)
  if (!entry) return null
  const nameZh = parseZhName(await fetchOk(gamePanelUrl(slug, 'zh')))
  return toBgaGame(entry, nameZh)
}

/** 給 scripts/bga-import.ts 用：找不到就丟錯誤 */
export async function fetchBgaGame(slug: string): Promise<BgaGame> {
  const game = await lookupBgaGame(slug)
  if (!game) throw new Error(`BGA 找不到 ${slug}`)
  return game
}

/** 呼叫 BGA 的部分；測試時換成假的實作 */
export interface BgaClient {
  /** 找不到回傳 null；BGA 連不上時丟出 502 */
  lookup(slug: string): Promise<BgaGame | null>
}

export function createBgaClient(): BgaClient {
  return {
    async lookup(slug) {
      try {
        return await lookupBgaGame(slug)
      } catch (err) {
        throw new AppError('bga_unavailable', 502, 'BGA 暫時連不上，稍後再試', undefined, err)
      }
    },
  }
}
