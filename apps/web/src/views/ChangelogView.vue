<script setup lang="ts">
import { BACKLOG, CHANGELOG } from '../changelog.ts'
import { useAppConfig } from '../composables/app-config.ts'
import { locale } from '../i18n/index.ts'

const { data: config } = useAppConfig()

/** 更新紀錄的內容只有中文，標籤跟著介面語言 */
const KINDS = {
  新增: { key: 'added', class: 'bg-accent text-accent-ink' },
  改進: { key: 'improved', class: 'bg-ink text-bg' },
  修正: { key: 'fixed', class: 'bg-danger text-card' },
} as const
</script>

<template>
  <section class="mx-auto grid max-w-2xl gap-6">
    <div class="grid gap-1">
      <h1 class="text-2xl font-black">{{ $t('changelog.title') }}</h1>
      <p v-if="locale === 'en'" class="text-sm text-muted">{{ $t('changelog.languageNote') }}</p>
    </div>

    <section
      v-if="BACKLOG.length"
      class="grid gap-3 rounded-2xl border border-dashed border-line p-5"
      aria-labelledby="backlog"
    >
      <h2 id="backlog" class="text-lg font-black">{{ $t('changelog.backlog') }}</h2>
      <p class="text-sm text-muted">{{ $t('changelog.backlogIntro') }}</p>
      <ul class="grid gap-1.5">
        <li v-for="item in BACKLOG" :key="item" class="flex items-start gap-2 text-sm">
          <span class="mt-0.5 flex-none rounded border border-line px-1.5 text-xs text-muted">
            {{ $t('changelog.backlog') }}
          </span>
          <span>{{ item }}</span>
        </li>
      </ul>
    </section>
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
          {{ $t('changelog.current') }}
        </span>
      </header>
      <p v-if="release.summary">{{ release.summary }}</p>
      <ul class="grid gap-1.5">
        <li v-for="(c, i) in release.changes" :key="i" class="flex items-start gap-2 text-sm">
          <span
            class="mt-0.5 flex-none rounded px-1.5 text-xs font-bold"
            :class="KINDS[c.kind].class"
          >
            {{ $t(`changelog.kind.${KINDS[c.kind].key}`) }}
          </span>
          <span>{{ c.text }}</span>
        </li>
      </ul>
    </article>
  </section>
</template>
