<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const ERRORS = {
  denied: '你取消了 Discord 授權。',
  expired: '登入逾時，請再試一次。',
  failed: '登入失敗，請稍後再試。',
} as const
const error = computed(() => {
  const value = route.query.error
  return typeof value === 'string' && value in ERRORS
    ? ERRORS[value as keyof typeof ERRORS]
    : undefined
})

/** OAuth 起點；returnTo 由 server 再檢查一次 */
const loginHref = computed(() => {
  const returnTo = typeof route.query.returnTo === 'string' ? route.query.returnTo : '/'
  return `/auth/discord/login?returnTo=${encodeURIComponent(returnTo)}`
})
</script>

<template>
  <main class="flex min-h-dvh items-center justify-center bg-bg px-safe">
    <div class="grid w-full max-w-sm gap-5 rounded-2xl bg-card p-6 shadow-card">
      <div class="grid gap-1">
        <h1 class="text-2xl font-black">登入</h1>
        <p class="text-sm text-muted">桌遊機制圖譜只給成員使用，請用 Discord 登入。</p>
      </div>
      <p v-if="error" class="rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger" role="alert">
        {{ error }}
      </p>
      <a
        :href="loginHref"
        class="rounded-xl bg-accent px-4 py-3 text-center font-bold text-accent-ink"
      >
        用 Discord 登入
      </a>
    </div>
  </main>
</template>
