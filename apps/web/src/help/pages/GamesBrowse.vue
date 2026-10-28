<script setup lang="ts">
import { byLocalName, localName } from '../../i18n/index.ts'
import DemoStage from '../DemoStage.vue'
import DemoCover from '../DemoCover.vue'
import DemoCursor from '../DemoCursor.vue'
import HelpTips from '../HelpTips.vue'
import { SAMPLE_GRAPH, sampleGame, sampleGameMechanisms } from '../samples.ts'

const ROWS = SAMPLE_GRAPH.games.slice(0, 3)
const OPEN = sampleGame('splendor')
const META: Record<string, string> = { hanabi: '2–5', splendor: '2–4', carcassonne: '2–5' }
const TARGETS = ['[data-meta]', '[data-variant="icon"]', `[data-row="${OPEN.id}"]`]
</script>

<template>
  <p>{{ $t('help.pages.games.browse.intro') }}</p>

  <DemoStage
    :steps="[
      $t('help.pages.games.browse.steps.list'),
      $t('help.pages.games.browse.steps.image'),
      $t('help.pages.games.browse.steps.open'),
    ]"
  >
    <template #default="{ step, acted, done }">
      <div class="mx-auto grid h-64 max-w-md content-start">
        <div v-if="!done(2)" class="animate-demo-in grid gap-2">
          <div class="flex flex-wrap items-center gap-1.5 text-xs">
            <span class="mr-1 text-muted">{{ $t('imageVariant.label') }}</span>
            <span
              v-for="key in ['icon', 'bannerTitle'] as const"
              :key="key"
              :data-variant="key"
              class="rounded-full border px-2.5 py-0.5"
              :class="
                (key === 'icon') === done(1)
                  ? 'border-ink bg-ink text-bg'
                  : 'border-line text-muted'
              "
              >{{ $t(`imageVariant.${key}`) }}</span
            >
          </div>
          <div
            v-for="g in [...ROWS].sort(byLocalName)"
            :key="g.id"
            :data-row="g.id"
            class="flex items-center gap-3 rounded-xl bg-card px-3 py-2 shadow-card"
          >
            <DemoCover :id="g.id" :size="done(1) ? 'md' : 'banner'" />
            <span class="flex-1 font-bold">{{ localName(g) }}</span>
            <span
              :data-meta="g.id === OPEN.id ? '' : undefined"
              class="text-xs text-muted tabular-nums"
            >
              {{ $t('help.pages.games.browse.meta', { players: META[g.id] }) }}
              · {{ $t('games.mechanismCount', sampleGameMechanisms(g.id).length) }}
            </span>
          </div>
        </div>

        <div v-else class="animate-demo-in grid gap-3 rounded-2xl bg-card p-4 shadow-card">
          <div class="flex items-center gap-3">
            <DemoCover :id="OPEN.id" size="lg" />
            <div class="grid gap-1.5">
              <span class="text-lg font-black">{{ localName(OPEN) }}</span>
              <span class="flex gap-2 text-xs">
                <span class="rounded-full border border-line px-2.5 py-0.5 text-muted"
                  >☆ {{ $t('marks.wish') }}</span
                >
                <span class="rounded-full border border-line px-2.5 py-0.5 text-muted">{{
                  $t('marks.played')
                }}</span>
              </span>
            </div>
          </div>
          <div class="h-1.5 rounded-full bg-line">
            <div class="h-full w-1/2 rounded-full bg-accent" />
          </div>
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="m in sampleGameMechanisms(OPEN.id)"
              :key="m.id"
              class="flex items-center gap-1 rounded-full border border-line px-2 py-0.5 text-xs"
              ><span class="size-1.5 rounded-full bg-mechanism" />{{ localName(m) }}</span
            >
          </div>
        </div>
      </div>
      <DemoCursor :target="TARGETS[step] ?? null" :press="acted && step > 0" />
    </template>
  </DemoStage>

  <p>{{ $t('help.pages.games.browse.gamePage') }}</p>

  <HelpTips
    :tips="[
      $t('help.pages.games.browse.tips.sort'),
      $t('help.pages.games.browse.tips.image'),
      $t('help.pages.games.browse.tips.links'),
    ]"
  />
</template>
