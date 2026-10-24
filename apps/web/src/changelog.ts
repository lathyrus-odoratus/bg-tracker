/**
 * 更新紀錄，新的在前。發新版時：根目錄 package.json 的 version 加一，並在最前面加一筆
 * （test/changelog.test.ts 會檢查最新一筆的版本與 package.json 一致）。
 */
export interface Release {
  version: string
  /** YYYY-MM-DD */
  date: string
  /** 這一版的重點，一句話 */
  summary?: string
  changes: { kind: '新增' | '改進' | '修正'; text: string }[]
}

export const CHANGELOG: Release[] = [
  {
    version: '0.2.0',
    date: '2026-10-25',
    changes: [
      {
        kind: '新增',
        text: '首頁左側加上遊戲圖示，移上去顯示名稱並在圓形圖上點亮，點擊看詳情（寬螢幕）',
      },
      { kind: '改進', text: '圓形圖上太長的名稱改成截斷，移上去可以看完整名稱' },
    ],
  },
  {
    version: '0.1.0',
    date: '2026-10-25',
    summary: '第一個版本上線（bg-tracker.miao-bao.cc）。',
    changes: [
      { kind: '新增', text: '首頁圓形關係圖：遊戲在右半圈、機制在左半圈，移上去點亮相關連線' },
      { kind: '新增', text: '點擊圖上的節點，在旁邊看遊戲或機制的詳情，並連到遊戲頁與遊玩紀錄' },
      { kind: '新增', text: '遊戲、機制的列表與詳細頁；遊戲頁有 BGA 圖片與「在 BGA 上玩」連結' },
      { kind: '新增', text: '大家想玩排行' },
      { kind: '新增', text: '留言板：留言、回覆、編輯（可以看每一版），新的在前、一次 25 則' },
      { kind: '新增', text: '管理頁：新增、編輯、刪除遊戲與機制（管理員）' },
      { kind: '新增', text: '右上角切換淺色、深色或跟系統' },
      { kind: '新增', text: '收錄 35 款 BGA 上的遊戲與 21 個機制' },
      { kind: '改進', text: '整個網站改成要用 Discord 登入' },
      { kind: '改進', text: '圓形圖的點擊區改成整格扇形，移上去會顯示虛線框' },
    ],
  },
]
