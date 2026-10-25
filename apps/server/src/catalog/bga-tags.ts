import { eq, inArray } from 'drizzle-orm'
import type { Tx } from '../db/client.ts'
import { gameMechanisms, gameThemes, mechanisms, themes } from '../db/schema/index.ts'
import type { BgaTag, BgaTags } from '../bga/catalog.ts'

/** BGA 標籤 id → 我們的機制／主題 id */
export interface TagIds {
  mechanisms: Map<number, string>
  themes: Map<number, string>
}

function tagRows(tags: BgaTag[]) {
  return tags.map((t) => ({ name: t.nameZh ?? t.nameEn, nameEn: t.nameEn, bgaTagId: t.tagId }))
}

/**
 * 把 BGA 的標籤補進機制、主題表：已經有的不動（admin 改過的名稱、填的說明都保留）。
 * 名稱和既有的撞到時略過那個標籤
 */
export async function upsertBgaTags(tx: Tx, tags: BgaTags): Promise<TagIds> {
  const ids = (rows: { id: string; bgaTagId: number | null }[]) =>
    new Map(rows.map((r) => [r.bgaTagId!, r.id]))
  const mechanismTagIds = tags.mechanisms.map((t) => t.tagId)
  const themeTagIds = tags.themes.map((t) => t.tagId)
  if (mechanismTagIds.length) {
    await tx.insert(mechanisms).values(tagRows(tags.mechanisms)).onConflictDoNothing()
  }
  if (themeTagIds.length) {
    await tx.insert(themes).values(tagRows(tags.themes)).onConflictDoNothing()
  }
  return {
    mechanisms: ids(
      mechanismTagIds.length
        ? await tx
            .select({ id: mechanisms.id, bgaTagId: mechanisms.bgaTagId })
            .from(mechanisms)
            .where(inArray(mechanisms.bgaTagId, mechanismTagIds))
        : [],
    ),
    themes: ids(
      themeTagIds.length
        ? await tx
            .select({ id: themes.id, bgaTagId: themes.bgaTagId })
            .from(themes)
            .where(inArray(themes.bgaTagId, themeTagIds))
        : [],
    ),
  }
}

export async function setGameMechanisms(tx: Tx, gameId: string, mechanismIds: string[]) {
  await tx.delete(gameMechanisms).where(eq(gameMechanisms.gameId, gameId))
  const unique = [...new Set(mechanismIds)]
  if (unique.length) {
    await tx.insert(gameMechanisms).values(unique.map((mechanismId) => ({ gameId, mechanismId })))
  }
}

export async function setGameThemes(tx: Tx, gameId: string, themeIds: string[]) {
  await tx.delete(gameThemes).where(eq(gameThemes.gameId, gameId))
  const unique = [...new Set(themeIds)]
  if (unique.length) {
    await tx.insert(gameThemes).values(unique.map((themeId) => ({ gameId, themeId })))
  }
}

/** 遊戲的機制與主題以 BGA 為準：整份換成 BGA 上的標籤（`ids` 由 `upsertBgaTags` 取得） */
export async function applyBgaTags(tx: Tx, gameId: string, game: BgaTags, ids: TagIds) {
  const pick = (tags: BgaTag[], map: Map<number, string>) =>
    tags.flatMap((t) => map.get(t.tagId) ?? [])
  await setGameMechanisms(tx, gameId, pick(game.mechanisms, ids.mechanisms))
  await setGameThemes(tx, gameId, pick(game.themes, ids.themes))
}
