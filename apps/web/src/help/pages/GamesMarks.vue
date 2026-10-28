<script setup lang="ts">
import type { MyGameStat } from '@bg-tracker/shared'
import MarkToggles from '../../components/MarkToggles.vue'
import { localName } from '../../i18n/index.ts'
import DemoStage from '../DemoStage.vue'
import DemoCursor from '../DemoCursor.vue'
import HelpTips from '../HelpTips.vue'
import { sampleGame } from '../samples.ts'

const game = sampleGame('hanabi')
/** 用真的按鈕元件，狀態依示意的步驟給 */
function stat(done: (i: number) => boolean): MyGameStat {
  return {
    gameId: game.id,
    playCount: 0,
    lastPlayedAt: null,
    played: done(1),
    markedPlayed: done(1),
    wished: done(0) && !done(2),
  }
}
const TARGETS = ['wish', 'played', 'wish']
</script>

<template>
  <p>{{ $t('help.pages.games.marks.intro') }}</p>

  <DemoStage
    :steps="[
      $t('help.pages.games.marks.steps.wish'),
      $t('help.pages.games.marks.steps.played'),
      $t('help.pages.games.marks.steps.undo'),
    ]"
  >
    <template #default="{ step, acted, done }">
      <div class="mx-auto flex max-w-sm items-center gap-4 rounded-2xl bg-card p-4 shadow-card">
        <span
          class="flex size-16 flex-none items-center justify-center rounded-xl bg-game/15 text-3xl"
          >🎆</span
        >
        <div class="grid gap-2">
          <p class="text-lg font-black">{{ localName(game) }}</p>
          <MarkToggles :game-id="game.id" :stat="stat(done)" />
        </div>
      </div>
      <DemoCursor
        :target="`button:nth-of-type(${TARGETS[step] === 'wish' ? 1 : 2})`"
        :at="{ x: 0.6, y: 0.7 }"
        :press="acted"
      />
    </template>
  </DemoStage>

  <HelpTips
    :tips="[
      $t('help.pages.games.marks.tips.wishes'),
      $t('help.pages.games.marks.tips.records'),
      $t('help.pages.games.marks.tips.visible'),
    ]"
  />
</template>
