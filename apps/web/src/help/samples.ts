import type { Graph } from '@bg-tracker/shared'

/** 示意用的假資料（說明頁不用登入，不打 API） */
export const SAMPLE_GRAPH: Graph = {
  games: [
    { id: 'hanabi', name: '花火', nameEn: 'Hanabi' },
    { id: 'splendor', name: '璀璨寶石', nameEn: 'Splendor' },
    { id: 'carcassonne', name: '卡卡頌', nameEn: 'Carcassonne' },
    { id: 'sevenwonders', name: '七大奇蹟', nameEn: '7 Wonders' },
    { id: 'azul', name: '花磚物語', nameEn: 'Azul' },
  ],
  mechanisms: [
    { id: 'coop', name: '合作', nameEn: 'Cooperative' },
    { id: 'hand', name: '手牌管理', nameEn: 'Hand Management' },
    { id: 'tile', name: '板塊拼放', nameEn: 'Tile Placement' },
    { id: 'draft', name: '輪抽', nameEn: 'Card Drafting' },
    { id: 'set', name: '集合收集', nameEn: 'Set Collection' },
    { id: 'pattern', name: '圖案拼砌', nameEn: 'Pattern Building' },
  ],
  links: [
    { gameId: 'hanabi', mechanismId: 'coop' },
    { gameId: 'hanabi', mechanismId: 'hand' },
    { gameId: 'splendor', mechanismId: 'set' },
    { gameId: 'splendor', mechanismId: 'hand' },
    { gameId: 'carcassonne', mechanismId: 'tile' },
    { gameId: 'sevenwonders', mechanismId: 'draft' },
    { gameId: 'sevenwonders', mechanismId: 'set' },
    { gameId: 'azul', mechanismId: 'pattern' },
    { gameId: 'azul', mechanismId: 'tile' },
    { gameId: 'azul', mechanismId: 'draft' },
  ],
}

/** 示意的 Discord 名稱與改過的暱稱 */
export const SAMPLE_DISCORD_NAME = 'alex0817'
export const SAMPLE_NICKNAME = 'Alex'

export const sampleGame = (id: string) => SAMPLE_GRAPH.games.find((g) => g.id === id)!
export const sampleMechanism = (id: string) => SAMPLE_GRAPH.mechanisms.find((m) => m.id === id)!

/** 示意的遊戲圖（不載入 BGA 的圖片） */
export const SAMPLE_EMOJI: Record<string, string> = {
  hanabi: '🎆',
  splendor: '💎',
  carcassonne: '🏰',
  sevenwonders: '🏛️',
  azul: '🔷',
}

export const SAMPLE_THEMES = [
  { id: 'renaissance', name: '文藝復興', nameEn: 'Renaissance', games: ['splendor', 'azul'] },
  { id: 'medieval', name: '中世紀', nameEn: 'Medieval', games: ['carcassonne'] },
  { id: 'ancient', name: '古代', nameEn: 'Ancient', games: ['sevenwonders'] },
  { id: 'fireworks', name: '煙火', nameEn: 'Fireworks', games: ['hanabi'] },
]

/** 某款遊戲用到的機制 */
export const sampleGameMechanisms = (gameId: string) =>
  SAMPLE_GRAPH.links.filter((l) => l.gameId === gameId).map((l) => sampleMechanism(l.mechanismId))

/** 用到某個機制的遊戲 */
export const sampleMechanismGames = (mechanismId: string) =>
  SAMPLE_GRAPH.links.filter((l) => l.mechanismId === mechanismId).map((l) => sampleGame(l.gameId))
