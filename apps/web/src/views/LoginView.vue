<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LocaleSwitch from '../components/LocaleSwitch.vue'

const route = useRoute()
const { t } = useI18n()

const ERRORS = ['denied', 'expired', 'failed'] as const
const error = computed(() => {
  const value = ERRORS.find((e) => e === route.query.error)
  return value ? t(`login.${value}`) : undefined
})

/** OAuth 起點；returnTo 由 server 再檢查一次 */
const loginHref = computed(() => {
  const returnTo = typeof route.query.returnTo === 'string' ? route.query.returnTo : '/'
  return `/auth/discord/login?returnTo=${encodeURIComponent(returnTo)}`
})
</script>

<template>
  <main class="relative flex min-h-dvh items-center justify-center bg-bg px-safe">
    <LocaleSwitch class="absolute top-3 right-[max(1rem,env(safe-area-inset-right))]" />
    <div class="grid w-full max-w-sm gap-5 rounded-2xl bg-card p-6 shadow-card">
      <div class="grid gap-1">
        <h1 class="text-2xl font-black">{{ $t('login.title') }}</h1>
        <p class="text-sm text-muted">{{ $t('login.intro') }}</p>
      </div>
      <p v-if="error" class="rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger" role="alert">
        {{ error }}
      </p>
      <a
        :href="loginHref"
        class="rounded-xl bg-accent px-4 py-3 text-center font-bold text-accent-ink"
      >
        {{ $t('login.button') }}
      </a>
      <RouterLink to="/help" class="text-center text-sm text-muted hover:text-ink hover:underline">
        {{ $t('help.fromLogin') }}
      </RouterLink>
    </div>
  </main>
</template>
