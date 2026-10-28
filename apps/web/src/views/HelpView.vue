<script setup lang="ts">
import { computed, useTemplateRef, watch } from 'vue'
import { useRoute } from 'vue-router'
import HelpNav from '../help/HelpNav.vue'
import HelpPending from '../help/HelpPending.vue'
import { HELP_PAGES, findHelpPage, helpPath } from '../help/registry.ts'

/** 使用說明（不用登入也能看）：左邊目錄，右邊一篇一個功能 */
const route = useRoute()
const current = computed(() => findHelpPage(route.params.module, route.params.page))
const index = computed(() => (current.value ? HELP_PAGES.indexOf(current.value) : -1))
const prev = computed(() => (index.value > 0 ? HELP_PAGES[index.value - 1] : undefined))
const next = computed(() => (index.value >= 0 ? HELP_PAGES[index.value + 1] : undefined))

// 窄螢幕的目錄收在 <details>：換篇後收起來
const toc = useTemplateRef<HTMLDetailsElement>('toc')
watch(
  () => route.path,
  () => {
    if (toc.value) toc.value.open = false
  },
)
</script>

<template>
  <div class="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-10">
    <aside
      class="hidden lg:sticky lg:top-6 lg:block lg:max-h-[calc(100dvh-3rem)] lg:self-start lg:overflow-y-auto lg:pb-4"
    >
      <HelpNav />
    </aside>

    <details ref="toc" class="rounded-2xl bg-card shadow-card lg:hidden">
      <summary class="cursor-pointer px-4 py-3 text-sm font-bold">
        {{ $t('help.toc') }}
        <span v-if="current" class="font-normal text-muted">
          · {{ $t(`help.pages.${current.module}.${current.id}.title`) }}
        </span>
      </summary>
      <div class="border-t border-line p-4">
        <HelpNav />
      </div>
    </details>

    <article v-if="current" class="grid max-w-3xl min-w-0 content-start gap-6">
      <header class="grid gap-1">
        <p class="text-sm font-bold text-accent">{{ $t(`help.modules.${current.module}`) }}</p>
        <h1 class="text-3xl font-black">
          {{ $t(`help.pages.${current.module}.${current.id}.title`) }}
        </h1>
      </header>

      <component :is="current.component" v-if="current.component" :key="route.path" />
      <HelpPending v-else :module="current.module" />

      <nav class="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-6 text-sm">
        <RouterLink
          v-if="prev"
          :to="helpPath(prev)"
          class="grid gap-0.5 rounded-xl border border-line p-3 hover:border-accent"
        >
          <span class="text-muted">← {{ $t('help.prev') }}</span>
          <span class="font-bold">{{ $t(`help.pages.${prev.module}.${prev.id}.title`) }}</span>
        </RouterLink>
        <span v-else />
        <RouterLink
          v-if="next"
          :to="helpPath(next)"
          class="grid gap-0.5 rounded-xl border border-line p-3 text-right hover:border-accent"
        >
          <span class="text-muted">{{ $t('help.next') }} →</span>
          <span class="font-bold">{{ $t(`help.pages.${next.module}.${next.id}.title`) }}</span>
        </RouterLink>
      </nav>
    </article>

    <article v-else class="grid content-start gap-3">
      <h1 class="text-2xl font-black">{{ $t('help.notFound') }}</h1>
      <RouterLink to="/help" class="text-accent hover:underline">
        {{ $t('help.pages.start.welcome.title') }} →
      </RouterLink>
    </article>
  </div>
</template>
