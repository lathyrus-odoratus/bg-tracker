import { readStorage, writeStorage } from './storage.ts'

/** 匿名時的想玩清單存在瀏覽器（遊戲 id 陣列）；登入後併入帳號 */
const KEY = 'bgt:wishes'

export function readLocalWishes(): Set<string> {
  try {
    const parsed: unknown = JSON.parse(readStorage(KEY) ?? '[]')
    return new Set(Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string') : [])
  } catch {
    return new Set()
  }
}

export function writeLocalWishes(ids: Set<string>) {
  writeStorage(KEY, JSON.stringify([...ids]))
}
