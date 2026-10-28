<script setup lang="ts">
import { HELP_MODULES, helpPath } from './registry.ts'

/** 說明的目錄：依模組分組；還沒寫的篇章淡一點並標「準備中」 */
</script>

<template>
  <nav class="grid gap-5 text-sm" :aria-label="$t('help.toc')">
    <section v-for="m in HELP_MODULES" :key="m.id" class="grid gap-1">
      <h2 class="px-3 text-xs font-bold tracking-wide text-muted">
        {{ $t(`help.modules.${m.id}`) }}
      </h2>
      <ul class="grid gap-0.5 border-l border-line">
        <li v-for="p in m.pages" :key="p.id">
          <RouterLink
            :to="helpPath({ module: m.id, id: p.id })"
            class="-ml-px flex items-center justify-between gap-2 border-l-2 border-transparent px-3 py-1 transition-colors hover:border-muted hover:text-ink"
            :class="p.component ? 'text-ink' : 'text-muted'"
            exact-active-class="!border-accent font-bold !text-accent"
          >
            {{ $t(`help.pages.${m.id}.${p.id}.title`) }}
            <span
              v-if="!p.component"
              class="flex-none rounded-full border border-dashed border-line px-1.5 text-[11px] font-normal"
              >{{ $t('help.pending') }}</span
            >
          </RouterLink>
        </li>
      </ul>
    </section>
  </nav>
</template>
