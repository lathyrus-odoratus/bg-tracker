<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useSessionStore } from '../stores/session.ts'

const session = useSessionStore()
const router = useRouter()

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
      <div v-if="session.me" class="flex items-center gap-3">
        <img :src="session.me.avatarUrl" alt="" class="size-8 rounded-full" />
        <span class="hidden text-sm font-medium sm:inline">{{ session.me.displayName }}</span>
        <button type="button" class="text-sm text-muted hover:text-ink" @click="logout">
          登出
        </button>
      </div>
    </header>
    <main class="min-h-0 flex-1 px-safe py-6">
      <slot />
    </main>
  </div>
</template>
