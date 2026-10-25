/** BGA 的遊戲頁（介面語言跟著 BGA 的帳號設定） */
export function bgaGameUrl(slug: string) {
  return `https://boardgamearena.com/gamepanel?game=${slug}`
}

const MEDIA = 'https://x.boardgamearena.net/data/gamemedia'

/**
 * BGA 每款遊戲都有的圖（網址只看遊戲代號）。`width`／`height` 是原圖尺寸，決定顯示比例。
 * 給人看的名稱在 i18n 的 `imageVariant`
 * - 盒子：英文版盒子圖，少數遊戲沒有英文版時載入失敗、顯示佔位卡
 * - 橫幅＋標題：橫幅當底，透明背景的標題字（2000×2000，logo 在中間一條）疊在上面
 */
export const BGA_IMAGES = {
  box75: { width: 75, height: 75 },
  box280: { width: 280, height: 280 },
  icon: { width: 50, height: 50 },
  bannerTitle: { width: 1386, height: 400 },
} as const

export type BgaImageKey = keyof typeof BGA_IMAGES

export function bgaImageUrls(slug: string, key: BgaImageKey): { base: string; overlay?: string } {
  const at = (path: string) => `${MEDIA}/${slug}/${path}`
  switch (key) {
    case 'box75':
      return { base: at('box/en_75.png') }
    case 'box280':
      return { base: at('box/en_280.png') }
    case 'icon':
      return { base: at('icon/default.png') }
    case 'bannerTitle':
      return { base: at('banner/default_500.jpg'), overlay: at('title/en.png') }
  }
}
