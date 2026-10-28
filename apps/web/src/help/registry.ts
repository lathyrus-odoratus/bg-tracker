import { defineAsyncComponent, type Component } from 'vue'

/**
 * 使用說明的目錄：側欄、路由（/help/:module/:page）、上一篇／下一篇都從這裡產生。
 * 標題在 i18n 的 `help.modules.<module>`、`help.pages.<module>.<page>.title`（test/help.test.ts 檢查）。
 * 還沒寫的篇章不給 `component`，顯示「準備中」
 */
export interface HelpPage {
  module: string
  id: string
  component?: Component
}

const page = (load: () => Promise<{ default: Component }>) => defineAsyncComponent(load)

export const HELP_MODULES: { id: string; pages: Omit<HelpPage, 'module'>[] }[] = [
  {
    id: 'start',
    pages: [
      { id: 'welcome', component: page(() => import('./pages/StartWelcome.vue')) },
      { id: 'login', component: page(() => import('./pages/StartLogin.vue')) },
      { id: 'display', component: page(() => import('./pages/StartDisplay.vue')) },
    ],
  },
  {
    id: 'graph',
    pages: [
      { id: 'read', component: page(() => import('./pages/GraphRead.vue')) },
      { id: 'wishes', component: page(() => import('./pages/GraphWishes.vue')) },
    ],
  },
  {
    id: 'games',
    pages: [
      { id: 'browse', component: page(() => import('./pages/GamesBrowse.vue')) },
      { id: 'marks', component: page(() => import('./pages/GamesMarks.vue')) },
      { id: 'weight', component: page(() => import('./pages/GamesWeight.vue')) },
      { id: 'add', component: page(() => import('./pages/GamesAdd.vue')) },
    ],
  },
  {
    id: 'tags',
    pages: [
      { id: 'mechanisms', component: page(() => import('./pages/TagsMechanisms.vue')) },
      { id: 'themes', component: page(() => import('./pages/TagsThemes.vue')) },
    ],
  },
  {
    id: 'board',
    pages: [
      { id: 'post', component: page(() => import('./pages/BoardPost.vue')) },
      { id: 'edit', component: page(() => import('./pages/BoardEdit.vue')) },
    ],
  },
  {
    id: 'account',
    pages: [{ id: 'nickname', component: page(() => import('./pages/AccountNickname.vue')) }],
  },
  {
    id: 'admin',
    pages: [
      { id: 'review', component: page(() => import('./pages/AdminReview.vue')) },
      { id: 'sync', component: page(() => import('./pages/AdminSync.vue')) },
    ],
  },
]

export const HELP_PAGES: HelpPage[] = HELP_MODULES.flatMap((m) =>
  m.pages.map((p) => ({ module: m.id, ...p })),
)

export function helpPath(p: Pick<HelpPage, 'module' | 'id'>) {
  return `/help/${p.module}/${p.id}`
}

export function findHelpPage(module: unknown, id: unknown) {
  return HELP_PAGES.find((p) => p.module === module && p.id === id)
}
