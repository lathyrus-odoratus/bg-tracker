<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useSessionStore } from '../stores/session.ts'
import ThemeSwitch from '../components/ThemeSwitch.vue'
import LocaleSwitch from '../components/LocaleSwitch.vue'
import { useAppConfig } from '../composables/app-config.ts'
import { loginPath } from '../router.ts'

const session = useSessionStore()
const router = useRouter()
const route = useRoute()
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
        <RouterLink to="/" class="text-lg font-black">{{ $t('app.title') }}</RouterLink>
        <template v-if="session.me">
          <RouterLink to="/games" class="text-sm text-muted" active-class="!text-ink font-bold">
            {{ $t('nav.games') }}
          </RouterLink>
          <RouterLink
            to="/mechanisms"
            class="text-sm text-muted"
            active-class="!text-ink font-bold"
          >
            {{ $t('nav.mechanisms') }}
          </RouterLink>
          <RouterLink to="/themes" class="text-sm text-muted" active-class="!text-ink font-bold">
            {{ $t('nav.themes') }}
          </RouterLink>
          <RouterLink to="/board" class="text-sm text-muted" active-class="!text-ink font-bold">
            {{ $t('nav.board') }}
          </RouterLink>
        </template>
      </nav>
      <div class="flex items-center gap-3">
        <RouterLink
          to="/help"
          class="flex h-8 min-w-8 items-center justify-center gap-1 rounded-full border border-line px-2 text-sm font-medium text-muted hover:text-ink"
          active-class="!border-accent !text-accent"
          :title="$t('help.title')"
        >
          <span aria-hidden="true">?</span>
          <span class="sr-only sm:not-sr-only">{{ $t('help.link') }}</span>
        </RouterLink>
        <LocaleSwitch />
        <ThemeSwitch />
        <template v-if="session.me">
          <RouterLink
            to="/settings"
            class="flex items-center gap-2 rounded-full hover:text-accent"
            :title="$t('settings.link')"
          >
            <img :src="session.me.avatarUrl" alt="" class="size-8 rounded-full" />
            <span class="hidden text-sm font-medium sm:inline">{{ session.me.displayName }}</span>
            <span class="sr-only sm:hidden">{{ $t('settings.link') }}</span>
          </RouterLink>
          <button type="button" class="text-sm text-muted hover:text-ink" @click="logout">
            {{ $t('app.logout') }}
          </button>
        </template>
        <!-- 只有公開頁面（使用說明）會在未登入時看到外殼 -->
        <RouterLink
          v-else
          :to="loginPath(route.fullPath)"
          class="rounded-full bg-accent px-3 py-1 text-sm font-bold whitespace-nowrap text-accent-ink"
        >
          {{ $t('login.title') }}
        </RouterLink>
      </div>
    </header>
    <main class="min-h-0 flex-1 px-safe py-6">
      <slot />
    </main>
    <footer
      class="flex flex-wrap items-center justify-center gap-x-3 border-t border-line px-safe py-4 text-xs text-muted"
    >
      <span>{{ $t('app.title') }}</span>
      <!-- 本機開發時沒有寫入版本（APP_VERSION 預設 dev） -->
      <span v-if="config" class="tabular-nums">
        <template v-if="config.version === 'dev'">{{ $t('app.dev') }}</template>
        <template v-else>v{{ config.version }} · {{ config.commit.slice(0, 7) }}</template>
      </span>
      <RouterLink to="/changelog" class="hover:text-ink hover:underline">{{
        $t('app.changelog')
      }}</RouterLink>
    </footer>
  </div>
</template>
