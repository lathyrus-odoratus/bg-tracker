import { AppError } from '../errors.ts'

/**
 * 從 BGA 的遊戲頁取出遊戲資料。BGA 沒有公開 API：
 * - 英文頁（`en.`）內嵌全站遊戲目錄的 JSON，每款一個物件（`"name":"<slug>"`）
 * - 中文頁（`zh.`，繁體）的 og:title 是「在Board Game Arena上線上玩<中文名>」
 * - 兩種語言的頁面都內嵌標籤定義（`{"id":114,"cat":"Theme","catKey":"theme","name":"Animals"}`），
 *   名稱跟著介面語言；遊戲的 `tags` 是 `[標籤 id, 排序]` 的陣列
 * 只在新增遊戲、管理員同步時呼叫，結果存進資料庫，不在瀏覽時打 BGA。
 */

/** BGA 的機制或主題標籤 */
export interface BgaTag {
  tagId: number
  nameEn: string
  /** 繁體中文名稱；沒有翻譯時為 null */
  nameZh: string | null
}

/** 全站的機制與主題標籤 */
export interface BgaTags {
  mechanisms: BgaTag[]
  themes: BgaTag[]
}

/** 目錄裡就有的遊戲資料（不含中文名稱，要另外打中文的遊戲頁） */
export interface BgaCatalogGame extends BgaTags {
  slug: string
  nameEn: string
  minPlayers: number | null
  maxPlayers: number | null
  bggId: number | null
  /** 盒子圖（280px 寬） */
  imageUrl: string | null
}

export interface BgaGame extends BgaCatalogGame {
  /** 繁體中文名稱；頁面沒有翻譯時為 null */
  nameZh: string | null
}

/** 全站目錄：標籤定義加上查單一遊戲 */
export interface BgaCatalog extends BgaTags {
  /** 不在目錄裡回傳 null */
  game(slug: string): BgaCatalogGame | null
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
  tags?: [number, number][]
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

interface TagDef {
  cat: string
  catKey: string
  name: string
}

const TAG_DEF_RE =
  /\{"id":(\d+),"cat":"((?:[^"\\]|\\.)*)","catKey":"([^"]*)","name":"((?:[^"\\]|\\.)*)"/g

/** 頁面裡的標籤定義：標籤 id → 分類與名稱（字串照 JSON 規則解開跳脫字元） */
export function parseTagDefs(html: string): Map<number, TagDef> {
  const defs = new Map<number, TagDef>()
  const unescape = (raw: string) => JSON.parse(`"${raw}"`) as string
  for (const [, id, cat, catKey, name] of html.matchAll(TAG_DEF_RE)) {
    defs.set(Number(id), { cat: unescape(cat!), catKey: catKey!, name: unescape(name!) })
  }
  return defs
}

/**
 * 從英文頁分類、中文頁取名稱。主題只算 `cat` 是 Theme 的：
 * 「Abstract games」的 catKey 也是 theme，但它是 Category，不算主題
 */
export function toBgaTags(en: Map<number, TagDef>, zh: Map<number, TagDef>): BgaTags {
  const pick = (match: (d: TagDef) => boolean) =>
    [...en]
      .filter(([, d]) => match(d))
      .map(([tagId, d]) => ({ tagId, nameEn: d.name, nameZh: zh.get(tagId)?.name ?? null }))
      .sort((a, b) => a.tagId - b.tagId)
  return {
    mechanisms: pick((d) => d.catKey === 'mechanism'),
    themes: pick((d) => d.catKey === 'theme' && d.cat === 'Theme'),
  }
}

/** 遊戲有的標籤，依 BGA 的排序 */
function gameTags(entry: CatalogEntry, all: BgaTags): BgaTags {
  const ordered = [...(entry.tags ?? [])].sort((a, b) => a[1] - b[1]).map(([id]) => id)
  const pick = (list: BgaTag[]) => ordered.flatMap((id) => list.find((t) => t.tagId === id) ?? [])
  return { mechanisms: pick(all.mechanisms), themes: pick(all.themes) }
}

export function toCatalogGame(entry: CatalogEntry, tags: BgaTags): BgaCatalogGame {
  const players = entry.player_numbers ?? []
  // 盒子圖有多種語言時優先用英文；`?h=` 是 BGA 的版本號，換圖時會變
  const boxLang = entry.media?.box?.en ? 'en' : Object.keys(entry.media?.box ?? {})[0]
  const boxVersion = boxLang && entry.media?.box?.[boxLang]
  return {
    slug: entry.name,
    nameEn: entry.display_name_en,
    minPlayers: players.length ? Math.min(...players) : null,
    maxPlayers: players.length ? Math.max(...players) : null,
    bggId: entry.bgg_id || null,
    imageUrl: boxLang
      ? `${MEDIA}/${entry.name}/box/${boxLang}_280.png${boxVersion ? `?h=${boxVersion}` : ''}`
      : null,
    ...gameTags(entry, tags),
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

/** 遊戲列表頁也內嵌全站目錄與標籤定義 */
const gameListUrl = (lang: string) => `https://${lang}.boardgamearena.com/gamelist`

/** BGA 沒有這個代號時回傳 null；網路或 BGA 本身的錯誤照常丟出 */
async function lookupBgaGame(slug: string): Promise<BgaGame | null> {
  if (!SLUG_RE.test(slug)) return null
  const panel = await fetchPage(gamePanelUrl(slug))
  if (!panel.ok) {
    // BGA 對不存在的遊戲回 500，和 BGA 真的出錯分不出來：查目錄，不在目錄裡才算找不到
    if (!parseCatalogEntry(await fetchOk(gameListUrl('en')), slug)) return null
    throw new Error(`GET ${gamePanelUrl(slug)} → ${panel.status}`)
  }
  const entry = parseCatalogEntry(panel.text, slug)
  if (!entry) return null
  const zh = await fetchOk(gamePanelUrl(slug, 'zh'))
  const tags = toBgaTags(parseTagDefs(panel.text), parseTagDefs(zh))
  return { ...toCatalogGame(entry, tags), nameZh: parseZhName(zh) }
}

/** 全站目錄：英文、中文的遊戲列表頁各打一次 */
async function fetchBgaCatalog(): Promise<BgaCatalog> {
  const [en, zh] = await Promise.all([fetchOk(gameListUrl('en')), fetchOk(gameListUrl('zh'))])
  const tags = toBgaTags(parseTagDefs(en), parseTagDefs(zh))
  return {
    ...tags,
    game(slug) {
      const entry = SLUG_RE.test(slug) ? parseCatalogEntry(en, slug) : null
      return entry && toCatalogGame(entry, tags)
    },
  }
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
  /** 全站目錄（同步既有遊戲的標籤用）；BGA 連不上時丟出 502 */
  catalog(): Promise<BgaCatalog>
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
    async catalog() {
      try {
        return await fetchBgaCatalog()
      } catch (err) {
        throw new AppError('bga_unavailable', 502, 'BGA 暫時連不上，稍後再試', undefined, err)
      }
    },
  }
}
