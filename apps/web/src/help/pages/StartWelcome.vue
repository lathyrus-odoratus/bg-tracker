<script setup lang="ts">
import { loginPath } from '../../router.ts'
import { useSessionStore } from '../../stores/session.ts'
import { HELP_MODULES, helpPath } from '../registry.ts'

/** 第一篇：網站是什麼，接著列出每一組說明 */
const session = useSessionStore()
</script>

<template>
  <p class="text-lg">{{ $t('help.pages.start.welcome.intro') }}</p>
  <p>{{ $t('help.pages.start.welcome.more') }}</p>

  <p
    v-if="!session.me"
    class="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-card p-4 text-sm shadow-card"
  >
    {{ $t('help.pages.start.welcome.membersOnly') }}
    <RouterLink
      :to="loginPath('/')"
      class="rounded-xl bg-accent px-4 py-2 font-bold text-accent-ink"
      >{{ $t('login.title') }}</RouterLink
    >
  </p>

  <section class="grid gap-3">
    <h2 class="text-lg font-bold">{{ $t('help.pages.start.welcome.sections') }}</h2>
    <ul class="grid gap-3 sm:grid-cols-2">
      <li
        v-for="m in HELP_MODULES.filter((m) => m.id !== 'start')"
        :key="m.id"
        class="grid content-start gap-1.5 rounded-2xl border border-line p-4 transition hover:-translate-y-0.5 hover:border-accent hover:shadow-card motion-reduce:transition-none"
      >
        <span class="font-bold">{{ $t(`help.modules.${m.id}`) }}</span>
        <ul class="grid gap-0.5 text-sm">
          <li v-for="p in m.pages" :key="p.id">
            <RouterLink
              :to="helpPath({ module: m.id, id: p.id })"
              class="hover:underline"
              :class="p.component ? 'text-accent' : 'text-muted'"
            >
              {{ $t(`help.pages.${m.id}.${p.id}.title`) }}
              <template v-if="!p.component">（{{ $t('help.pending') }}）</template>
            </RouterLink>
          </li>
        </ul>
      </li>
    </ul>
  </section>
</template>
