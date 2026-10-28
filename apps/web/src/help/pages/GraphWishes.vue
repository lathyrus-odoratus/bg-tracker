<script setup lang="ts">
import { byLocalName, localName } from '../../i18n/index.ts'
import DemoStage from '../DemoStage.vue'
import DemoCover from '../DemoCover.vue'
import DemoCursor from '../DemoCursor.vue'
import HelpTips from '../HelpTips.vue'
import { SAMPLE_GRAPH, sampleGame } from '../samples.ts'

const BASE: Record<string, number> = {
  hanabi: 4,
  splendor: 3,
  azul: 2,
  carcassonne: 2,
  sevenwonders: 1,
}
/**
 * 示意裡被標想玩的那一款：2 人變 3 人，和璀璨寶石同人數、依名稱排在前面，往上跳一名
 * （中文依筆畫、英文依字母都是花磚物語／Azul 在前）
 */
const PICK = sampleGame('azul')

/** 排行：人數多的在前，同人數依名稱 */
function ranking(done: (i: number) => boolean) {
  return SAMPLE_GRAPH.games
    .filter((g) => BASE[g.id])
    .map((g) => ({ ...g, count: BASE[g.id]! + (g.id === PICK.id && done(1) ? 1 : 0) }))
    .sort((a, b) => b.count - a.count || byLocalName(a, b))
}
const TARGETS = [null, '[data-wish]', `[data-rank="${PICK.id}"]`]
</script>

<template>
  <p>{{ $t('help.pages.graph.wishes.intro') }}</p>

  <DemoStage
    :steps="[
      $t('help.pages.graph.wishes.steps.list'),
      $t('help.pages.graph.wishes.steps.wish'),
      $t('help.pages.graph.wishes.steps.open'),
    ]"
    :durations="[2400, 3000, 2600]"
  >
    <template #default="{ step, acted, done }">
      <div class="mx-auto grid max-w-lg items-start gap-4 sm:grid-cols-[1fr_14rem]">
        <div class="grid gap-2 rounded-2xl bg-card p-3 text-sm shadow-card">
          <span class="text-xs text-muted">{{ $t('help.pages.graph.wishes.others') }}</span>
          <div class="flex items-center gap-2">
            <DemoCover :id="PICK.id" />
            <span class="font-bold">{{ localName(PICK) }}</span>
          </div>
          <span
            data-wish
            class="justify-self-start rounded-full border px-3 py-0.5 font-medium transition"
            :class="done(1) ? 'border-accent bg-accent text-accent-ink' : 'border-line text-muted'"
            >{{ done(1) ? '★' : '☆' }} {{ $t('marks.wish') }}</span
          >
        </div>

        <section class="grid gap-2 rounded-2xl bg-card p-4 shadow-card">
          <h2 class="font-bold">{{ $t('topWishes.title') }}</h2>
          <TransitionGroup tag="ol" name="rank" class="relative grid gap-1">
            <li
              v-for="(w, i) in ranking(done)"
              :key="w.id"
              :data-rank="w.id"
              class="flex items-baseline gap-2 text-sm"
            >
              <span class="w-4 flex-none text-right text-muted tabular-nums">{{ i + 1 }}</span>
              <span
                class="min-w-0 flex-1 truncate"
                :class="{ 'font-bold text-accent': w.id === PICK.id && done(1) }"
                >{{ localName(w) }}</span
              >
              <span class="flex-none text-muted tabular-nums">{{
                $t('topWishes.count', w.count)
              }}</span>
            </li>
          </TransitionGroup>
        </section>
      </div>
      <DemoCursor :target="TARGETS[step] ?? null" :at="{ x: 0.3 }" :press="acted && step > 0" />
    </template>
  </DemoStage>

  <HelpTips
    :tips="[
      $t('help.pages.graph.wishes.tips.who'),
      $t('help.pages.graph.wishes.tips.names'),
      $t('help.pages.graph.wishes.tips.selected'),
    ]"
  />
</template>

<style scoped>
.rank-move {
  transition: transform 600ms cubic-bezier(0.3, 1.2, 0.5, 1);
}
@media (prefers-reduced-motion: reduce) {
  .rank-move {
    transition: none;
  }
}
</style>
