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
    routes: [
      { path: '/', component: () => import('./views/HomeView.vue') },
      {
        path: '/login',
        component: () => import('./views/LoginView.vue'),
        meta: { bare: true },
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
