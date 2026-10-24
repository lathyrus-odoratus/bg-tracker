import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'
import App from './App.vue'
import { configureApi } from './lib/api.ts'
import { createQueryClient } from './lib/query.ts'
import { createAppRouter, loginPath } from './router.ts'
import { useSessionStore } from './stores/session.ts'
import './style.css'

const pinia = createPinia()
const session = useSessionStore(pinia)
const router = createAppRouter(pinia)

configureApi({
  onUnauthorized: async () => {
    // 登入中的 session 過期：需要登入的頁面回到登入頁，其他頁面改成匿名繼續看
    if (!session.me) return
    session.me = null
    const current = router.currentRoute.value
    if (current.meta.auth || current.meta.admin) await router.replace(loginPath(current.fullPath))
  },
})

createApp(App)
  .use(pinia)
  .use(router)
  .use(VueQueryPlugin, { queryClient: createQueryClient() })
  .mount('#app')
