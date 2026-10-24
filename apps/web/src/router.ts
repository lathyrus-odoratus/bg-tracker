import { createRouter, createWebHistory, type Router } from 'vue-router'
import type { Pinia } from 'pinia'
import { useSessionStore } from './stores/session.ts'

declare module 'vue-router' {
  interface RouteMeta {
    /** 需要登入（例如新增遊玩紀錄）；其他頁面匿名也能看 */
    auth?: boolean
    /** 只有 admin 進得去 */
    admin?: boolean
    /** 不顯示外殼（登入頁等） */
    bare?: boolean
  }
}

export function loginPath(returnTo: string) {
  return { path: '/login', query: { returnTo } }
}

export function createAppRouter(pinia: Pinia): Router {
  const router = createRouter({
    history: createWebHistory(),
    // 連到 #plays 這類錨點時捲過去；其他換頁回到頂端，上一頁回到原本的位置
    scrollBehavior(to, from, saved) {
      if (saved) return saved
      if (to.hash) return { el: to.hash }
      // 首頁只換選取（query）時不捲動
      if (to.path === from.path) return false
      return { top: 0 }
    },
    routes: [
      { path: '/', component: () => import('./views/HomeView.vue') },
      {
        path: '/login',
        component: () => import('./views/LoginView.vue'),
        meta: { bare: true },
      },
      // 未登入不跳轉，頁面自己顯示需要登入的提示
      { path: '/board', component: () => import('./views/BoardView.vue') },
      { path: '/games', component: () => import('./views/GamesView.vue') },
      { path: '/games/:id', component: () => import('./views/GameView.vue') },
      { path: '/mechanisms', component: () => import('./views/MechanismsView.vue') },
      { path: '/mechanisms/:id', component: () => import('./views/MechanismView.vue') },
      {
        path: '/admin/games/new',
        component: () => import('./views/admin/GameEditView.vue'),
        meta: { admin: true },
      },
      {
        path: '/admin/games/:id/edit',
        component: () => import('./views/admin/GameEditView.vue'),
        meta: { admin: true },
      },
      {
        path: '/admin/mechanisms/new',
        component: () => import('./views/admin/MechanismEditView.vue'),
        meta: { admin: true },
      },
      {
        path: '/admin/mechanisms/:id/edit',
        component: () => import('./views/admin/MechanismEditView.vue'),
        meta: { admin: true },
      },
      { path: '/:pathMatch(.*)*', component: () => import('./views/NotFoundView.vue') },
    ],
  })

  router.beforeEach(async (to) => {
    const session = useSessionStore(pinia)
    const me = await session.load()
    if ((to.meta.auth || to.meta.admin) && !me) return loginPath(to.fullPath)
    if (to.meta.admin && me?.systemRole !== 'admin') return { path: '/not-found' }
    return true
  })
  return router
}
