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

/** 還沒做、打算做的功能；做完就移到對應版本的 changes */
export const BACKLOG: string[] = [
  '研究討論遊戲還可以有哪些標籤',
  '輸入遊玩紀錄的功能',
  '遊戲列表的排序功能',
]

export const CHANGELOG: Release[] = [
  {
    version: '0.9.0',
    date: '2026-10-28',
    changes: [
      {
        kind: '新增',
        text: '使用說明（右上角的「?」）：每篇介紹一個功能，附自動播放的操作示意；不用登入也能看',
      },
    ],
  },
  {
    version: '0.8.0',
    date: '2026-10-25',
    changes: [
      {
        kind: '新增',
        text: '「我的設定」頁（點右上角的頭像）：可以改暱稱，也可以重設為 Discord 上的名稱',
      },
    ],
  },
  {
    version: '0.7.0',
    date: '2026-10-25',
    summary: '機制改用 BGA 的標籤，新增主題，介面可以切換成英文',
    changes: [
      {
        kind: '改進',
        text: '機制名單換成 BGA 的機制標籤，遊戲的機制以 BGA 為準；admin 可以一鍵從 BGA 同步所有遊戲',
      },
      { kind: '新增', text: '主題（動物、歷史…）：遊戲頁顯示主題，新增主題列表與主題頁' },
      { kind: '改進', text: '用 BGA 代號新增遊戲時，機制與主題一起帶入' },
      {
        kind: '新增',
        text: '右上角可以切換中文／英文；遊戲、機制、主題的名稱也跟著換（英文名稱取自 BGA）',
      },
      { kind: '改進', text: '遊戲頁的橫幅改成 2:1' },
    ],
  },
  {
    version: '0.6.0',
    date: '2026-10-25',
    changes: [
      { kind: '新增', text: '大家都能用 BGA 代號新增遊戲：先查詢預覽，名稱與人數從 BGA 帶入' },
      { kind: '新增', text: '成員新增的遊戲標記「需要 admin review」，admin 在遊戲頁確認後拿掉' },
    ],
  },
  {
    version: '0.5.0',
    date: '2026-10-25',
    changes: [
      {
        kind: '新增',
        text: '在遊戲頁用 slider 評遊戲的重度（複雜度，1.0–9.9），顯示大家的平均與評分人數',
      },
    ],
  },
  {
    version: '0.4.0',
    date: '2026-10-25',
    changes: [
      {
        kind: '新增',
        text: '新增、編輯遊戲時，填好 BGA 代號可以按「從 BGA 帶入」名稱、人數與 BGG id（只填空的欄位）',
      },
    ],
  },
  {
    version: '0.3.0',
    date: '2026-10-25',
    changes: [
      { kind: '新增', text: '在遊戲頁與首頁的詳情標「想玩」，大家想玩排行跟著更新' },
      { kind: '新增', text: '自己標「玩過」：還沒有遊玩紀錄也能標，會出現在遊戲頁的「誰玩過」' },
    ],
  },
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
