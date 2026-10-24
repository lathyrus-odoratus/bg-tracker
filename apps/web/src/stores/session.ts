import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Me } from '@bg-tracker/shared'
import { api, ApiError, unwrap } from '../lib/api.ts'

/**
 * 目前身分。整個網站都要登入，路由守衛在沒有身分時導到登入頁。
 */
export const useSessionStore = defineStore('session', () => {
  const me = ref<Me | null>(null)
  const loaded = ref(false)
  const isAdmin = computed(() => me.value?.systemRole === 'admin')

  /** 取得目前使用者；未登入時 me 為 null（不丟錯） */
  async function load(force = false) {
    if (loaded.value && !force) return me.value
    try {
      me.value = await unwrap(api.me.$get())
    } catch (err) {
      if (!(err instanceof ApiError) || err.status !== 401) throw err
      me.value = null
    }
    loaded.value = true
    return me.value
  }

  async function logout() {
    await api.auth.logout.$post()
    me.value = null
  }

  return { me, loaded, isAdmin, load, logout }
})
