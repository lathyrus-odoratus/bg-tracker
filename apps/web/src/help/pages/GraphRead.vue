<script setup lang="ts">
import CircleGraph, { type Selection } from '../../components/CircleGraph.vue'
import { localName } from '../../i18n/index.ts'
import DemoStage from '../DemoStage.vue'
import DemoCursor from '../DemoCursor.vue'
import HelpTips from '../HelpTips.vue'
import { SAMPLE_GRAPH, sampleGame } from '../samples.ts'

/** 用真的圓形圖，hover 與選取依步驟給 */
const HOVER: (Selection | null)[] = [
  { kind: 'game', id: 'azul' },
  { kind: 'mechanism', id: 'hand' },
  null,
  null,
]
const SELECTED = sampleGame('splendor')
const selected = (done: (i: number) => boolean): Selection | null =>
  done(2) && !done(3) ? { kind: 'game', id: SELECTED.id } : null
const TARGETS = [
  '[data-node="game:azul"] .dot',
  '[data-node="mechanism:hand"] .dot',
  `[data-node="game:${SELECTED.id}"] .dot`,
  '[data-graph]',
]
const mechanisms = SAMPLE_GRAPH.links
  .filter((l) => l.gameId === SELECTED.id)
  .map((l) => SAMPLE_GRAPH.mechanisms.find((m) => m.id === l.mechanismId)!)
</script>

<template>
  <p>{{ $t('help.pages.graph.read.intro') }}</p>

  <ul class="flex flex-wrap gap-x-5 gap-y-1 text-sm">
    <li class="flex items-center gap-1.5">
      <span class="size-2.5 rounded-full bg-game" />{{ $t('home.legendGame') }}
    </li>
    <li class="flex items-center gap-1.5">
      <span class="size-2.5 rounded-full bg-mechanism" />{{ $t('home.legendMechanism') }}
    </li>
  </ul>

  <DemoStage
    :steps="[
      $t('help.pages.graph.read.steps.game'),
      $t('help.pages.graph.read.steps.mechanism'),
      $t('help.pages.graph.read.steps.select'),
      $t('help.pages.graph.read.steps.clear'),
    ]"
    :durations="[2600, 2600, 3000, 2400]"
  >
    <template #default="{ step, acted, done }">
      <div class="grid items-center gap-4 sm:grid-cols-[minmax(0,1fr)_11rem]">
        <div data-graph class="mx-auto w-full max-w-sm">
          <CircleGraph
            :graph="SAMPLE_GRAPH"
            :selected="selected(done)"
            :highlight="acted ? HOVER[step] : null"
          />
        </div>
        <div
          class="grid min-h-28 content-start gap-2 rounded-2xl bg-card p-3 shadow-card transition-opacity duration-300"
          :class="selected(done) ? 'opacity-100' : 'opacity-0'"
        >
          <span class="font-black">{{ localName(SELECTED) }}</span>
          <span class="text-xs text-muted">{{
            $t('format.playersRange', { min: 2, max: 4 })
          }}</span>
          <div class="flex flex-wrap gap-1">
            <span
              v-for="m in mechanisms"
              :key="m.id"
              class="rounded-full bg-mechanism/15 px-2 py-0.5 text-xs"
              >{{ localName(m) }}</span
            >
          </div>
        </div>
      </div>
      <DemoCursor
        :target="TARGETS[step] ?? null"
        :at="step === 3 ? { x: 0.5, y: 0.5 } : undefined"
        :press="acted && step >= 2"
      />
    </template>
  </DemoStage>

  <HelpTips
    :tips="[
      $t('help.pages.graph.read.tips.share'),
      $t('help.pages.graph.read.tips.icons'),
      $t('help.pages.graph.read.tips.keyboard'),
    ]"
  />
</template>
