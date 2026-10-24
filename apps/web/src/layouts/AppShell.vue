<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useSessionStore } from '../stores/session.ts'
import ThemeSwitch from '../components/ThemeSwitch.vue'
import { useAppConfig } from '../composables/app-config.ts'

const session = useSessionStore()
const router = useRouter()
const { data: config } = useAppConfig()

/** 整個網站都要登入：登出後回到登入頁 */
async function logout() {
  await session.logout()
  await router.replace('/login')
}
</script>

<template>
  <div class="flex min-h-dvh flex-col bg-bg">
    <header class="flex items-center justify-between gap-3 border-b border-line px-safe py-3">
      <nav class="flex items-baseline gap-4">
        <RouterLink to="/" class="text-lg font-black">桌遊機制圖譜</RouterLink>
        <RouterLink to="/games" class="text-sm text-muted" active-class="!text-ink font-bold">
          遊戲
        </RouterLink>
        <RouterLink to="/mechanisms" class="text-sm text-muted" active-class="!text-ink font-bold">
          機制
        </RouterLink>
        <RouterLink to="/board" class="text-sm text-muted" active-class="!text-ink font-bold">
          留言板
        </RouterLink>
      </nav>
      <div class="flex items-center gap-3">
        <ThemeSwitch />
        <template v-if="session.me">
          <img :src="session.me.avatarUrl" alt="" class="size-8 rounded-full" />
          <span class="hidden text-sm font-medium sm:inline">{{ session.me.displayName }}</span>
          <button type="button" class="text-sm text-muted hover:text-ink" @click="logout">
            登出
          </button>
        </template>
      </div>
    </header>
    <main class="min-h-0 flex-1 px-safe py-6">
      <slot />
    </main>
    <footer
      class="flex flex-wrap items-center justify-center gap-x-3 border-t border-line px-safe py-4 text-xs text-muted"
    >
      <span>桌遊機制圖譜</span>
      <!-- 本機開發時沒有寫入版本（APP_VERSION 預設 dev） -->
      <span v-if="config" class="tabular-nums">
        <template v-if="config.version === 'dev'">開發版</template>
        <template v-else>v{{ config.version }} · {{ config.commit.slice(0, 7) }}</template>
      </span>
      <RouterLink to="/changelog" class="hover:text-ink hover:underline">更新紀錄</RouterLink>
    </footer>
  </div>
</template>
