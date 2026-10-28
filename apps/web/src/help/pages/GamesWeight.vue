<script setup lang="ts">
import { WEIGHT_MAX, WEIGHT_MIN } from '@bg-tracker/shared'
import DemoStage from '../DemoStage.vue'
import DemoCursor from '../DemoCursor.vue'
import HelpTips from '../HelpTips.vue'
import WeightDemo from '../WeightDemo.vue'

const AVERAGE = 6.2
const MINE = 7.5
const fraction = (w: number) => (w - WEIGHT_MIN) / (WEIGHT_MAX - WEIGHT_MIN)

/** 游標：拖動時跟著滑桿走（對準軌道上的位置，不對準正在移動的圓點） */
function cursor(step: number, acted: boolean) {
  if (step === 0) return { target: '[data-track]', at: { x: fraction(AVERAGE) } }
  if (step === 1) return { target: '[data-track]', at: { x: fraction(acted ? MINE : AVERAGE) } }
  if (step === 2) return { target: '[data-track]', at: { x: fraction(MINE), y: 2.5 } }
  return { target: '[data-clear]', at: { x: 0.3 } }
}
</script>

<template>
  <p>{{ $t('help.pages.games.weight.intro') }}</p>

  <DemoStage
    :steps="[
      $t('help.pages.games.weight.steps.start'),
      $t('help.pages.games.weight.steps.drag'),
      $t('help.pages.games.weight.steps.save'),
      $t('help.pages.games.weight.steps.clear'),
    ]"
    :durations="[2400, 2800, 2800, 2600]"
  >
    <template #default="{ step, acted, done }">
      <WeightDemo
        :average="AVERAGE"
        :mine="MINE"
        :dragging="done(1) && !done(3)"
        :saving="step === 2 && !acted"
        :saved="done(2) && !done(3)"
      />
      <DemoCursor
        v-bind="cursor(step, acted)"
        :press="(step === 1 && acted) || (step === 3 && acted)"
      />
    </template>
  </DemoStage>

  <HelpTips
    :tips="[
      $t('help.pages.games.weight.tips.keyboard'),
      $t('help.pages.games.weight.tips.scale'),
      $t('help.pages.games.weight.tips.average'),
    ]"
  />
</template>
