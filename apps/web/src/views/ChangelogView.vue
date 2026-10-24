<script setup lang="ts">
import { CHANGELOG } from '../changelog.ts'
import { useAppConfig } from '../composables/app-config.ts'

const { data: config } = useAppConfig()

const KIND_CLASS = {
  新增: 'bg-accent text-accent-ink',
  改進: 'bg-ink text-bg',
  修正: 'bg-danger text-card',
} as const
</script>

<template>
  <section class="mx-auto grid max-w-2xl gap-6">
    <h1 class="text-2xl font-black">更新紀錄</h1>
    <article
      v-for="release in CHANGELOG"
      :id="`v${release.version}`"
      :key="release.version"
      class="grid gap-3 rounded-2xl bg-card p-5 shadow-card"
    >
      <header class="flex flex-wrap items-baseline gap-x-3">
        <h2 class="text-lg font-black tabular-nums">v{{ release.version }}</h2>
        <time :datetime="release.date" class="text-sm text-muted tabular-nums">
          {{ release.date }}
        </time>
        <span
          v-if="config?.version === release.version"
          class="rounded-full border border-line px-2 text-xs text-muted"
        >
          目前版本
        </span>
      </header>
      <p v-if="release.summary">{{ release.summary }}</p>
      <ul class="grid gap-1.5">
        <li v-for="(c, i) in release.changes" :key="i" class="flex items-start gap-2 text-sm">
          <span
            class="mt-0.5 flex-none rounded px-1.5 text-xs font-bold"
            :class="KIND_CLASS[c.kind]"
          >
            {{ c.kind }}
          </span>
          <span>{{ c.text }}</span>
        </li>
      </ul>
    </article>
  </section>
</template>
