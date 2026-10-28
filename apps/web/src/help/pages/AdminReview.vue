<script setup lang="ts">
import ReviewBadge from '../../components/ReviewBadge.vue'
import { localName } from '../../i18n/index.ts'
import DemoStage from '../DemoStage.vue'
import DemoCover from '../DemoCover.vue'
import DemoCursor from '../DemoCursor.vue'
import HelpTips from '../HelpTips.vue'
import { sampleGame, sampleGameMechanisms } from '../samples.ts'

/** 成員剛新增、等 review 的那一款 */
const NEW = sampleGame('carcassonne')
const ROWS = [sampleGame('hanabi'), NEW, sampleGame('splendor')]
const TARGETS = [`[data-row="${NEW.id}"]`, '[data-edit]', '[data-confirm]']
</script>

<template>
  <p>{{ $t('help.pages.admin.review.intro') }}</p>

  <DemoStage
    :steps="[
      $t('help.pages.admin.review.steps.find'),
      $t('help.pages.admin.review.steps.check'),
      $t('help.pages.admin.review.steps.confirm'),
    ]"
    :durations="[2600, 2800, 3000]"
  >
    <template #default="{ step, acted, done }">
      <div class="mx-auto grid h-60 max-w-md content-start">
        <div v-if="!done(0)" class="animate-demo-in grid gap-2">
          <span class="text-lg font-black">{{ $t('games.title') }}</span>
          <div
            v-for="g in ROWS"
            :key="g.id"
            :data-row="g.id"
            class="flex items-center gap-3 rounded-xl bg-card px-3 py-2 shadow-card"
          >
            <DemoCover :id="g.id" />
            <span class="flex flex-wrap items-center gap-2 font-bold">
              {{ localName(g) }}
              <ReviewBadge v-if="g.id === NEW.id" />
            </span>
          </div>
        </div>

        <div v-else class="animate-demo-in grid gap-3 rounded-2xl bg-card p-4 shadow-card">
          <div class="flex items-center gap-3">
            <DemoCover :id="NEW.id" size="lg" />
            <span class="flex flex-wrap items-center gap-2 text-lg font-black">
              {{ localName(NEW) }}
              <Transition name="fade">
                <ReviewBadge v-if="!done(2)" />
              </Transition>
            </span>
          </div>
          <Transition name="fade">
            <div
              v-if="!done(2)"
              class="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-line px-3 py-2 text-xs"
            >
              <span class="text-muted">{{ $t('review.hint') }}</span>
              <span data-edit class="text-accent">{{ $t('common.edit') }}</span>
              <span data-confirm class="rounded-lg bg-ink px-3 py-0.5 font-bold text-bg">{{
                $t('review.confirm')
              }}</span>
            </div>
          </Transition>
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="m in sampleGameMechanisms(NEW.id)"
              :key="m.id"
              class="flex items-center gap-1 rounded-full border border-line px-2 py-0.5 text-xs"
              ><span class="size-1.5 rounded-full bg-mechanism" />{{ localName(m) }}</span
            >
          </div>
        </div>
      </div>
      <DemoCursor :target="TARGETS[step] ?? null" :at="{ x: 0.4 }" :press="acted && step !== 1" />
    </template>
  </DemoStage>

  <HelpTips
    :tips="[
      $t('help.pages.admin.review.tips.adminOnly'),
      $t('help.pages.admin.review.tips.noChange'),
      $t('help.pages.admin.review.tips.fullForm'),
    ]"
  />
</template>

<style scoped>
.fade-leave-active {
  transition:
    opacity 300ms,
    transform 300ms;
}
.fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
@media (prefers-reduced-motion: reduce) {
  .fade-leave-active {
    transition: none;
  }
}
</style>
