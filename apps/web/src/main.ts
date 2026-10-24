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
    // 使用中 session 過期：整個網站都要登入，回到登入頁，登入後回到原本的頁面
    if (!session.me) return
    session.me = null
    const current = router.currentRoute.value
    if (!current.meta.public) await router.replace(loginPath(current.fullPath))
  },
})

createApp(App)
  .use(pinia)
  .use(router)
  .use(VueQueryPlugin, { queryClient: createQueryClient() })
  .mount('#app')
