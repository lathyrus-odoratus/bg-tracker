<script setup lang="ts">
import ReviewBadge from '../../components/ReviewBadge.vue'
import { localName } from '../../i18n/index.ts'
import DemoStage from '../DemoStage.vue'
import DemoCover from '../DemoCover.vue'
import DemoCursor from '../DemoCursor.vue'
import HelpTips from '../HelpTips.vue'
import TypedText from '../TypedText.vue'
import { sampleGame } from '../samples.ts'

const game = sampleGame('hanabi')

/** 畫面：遊戲列表 → 新增表單（打字、查詢、預覽）→ 新增好的遊戲頁 */
function screen(done: (i: number) => boolean) {
  if (!done(0)) return 'list'
  return done(3) ? 'game' : 'form'
}
const TARGETS = ['[data-add]', '[data-slug]', '[data-lookup]', '[data-confirm]']
</script>

<template>
  <p>{{ $t('help.pages.games.add.intro') }}</p>

  <DemoStage
    :steps="[
      $t('help.pages.games.add.steps.open'),
      $t('help.pages.games.add.steps.slug'),
      $t('help.pages.games.add.steps.lookup'),
      $t('help.pages.games.add.steps.add'),
    ]"
    :durations="[2400, 2800, 2600, 3200]"
  >
    <template #default="{ step, acted, done }">
      <div class="mx-auto grid h-56 max-w-md content-start">
        <div v-if="screen(done) === 'list'" class="animate-demo-in grid gap-3">
          <div class="flex items-center justify-between">
            <span class="text-lg font-black">{{ $t('games.title') }}</span>
            <span
              data-add
              class="rounded-xl bg-accent px-3 py-1.5 text-sm font-bold text-accent-ink"
            >
              {{ $t('games.add') }}
            </span>
          </div>
          <div v-for="n in 3" :key="n" class="h-10 rounded-xl bg-card shadow-card" />
        </div>

        <div v-else-if="screen(done) === 'form'" class="animate-demo-in grid gap-3">
          <span class="text-lg font-black">{{ $t('addGame.title') }}</span>
          <div class="flex gap-2">
            <span
              data-slug
              class="h-10 min-w-0 flex-1 rounded-xl border border-line bg-card px-3 py-2"
              :class="{ 'border-accent': step === 1 }"
            >
              <TypedText
                text="hanabi"
                :mode="!done(1) ? 'empty' : step === 1 ? 'typing' : 'full'"
                :placeholder="$t('addGame.placeholder')"
              />
            </span>
            <span data-lookup class="flex-none rounded-xl border border-line px-4 py-2 font-medium">
              {{ $t('addGame.lookup') }}
            </span>
          </div>
          <div
            v-if="done(2)"
            class="animate-demo-in flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card"
          >
            <DemoCover :id="game.id" size="md" />
            <div class="grid flex-1 gap-0.5">
              <span class="font-black">{{ localName(game) }}</span>
              <span class="text-sm text-muted">{{
                $t('format.playersRange', { min: 2, max: 5 })
              }}</span>
            </div>
            <span data-confirm class="rounded-xl bg-accent px-4 py-2 font-bold text-accent-ink">
              {{ $t('addGame.add') }}
            </span>
          </div>
        </div>

        <div v-else class="animate-demo-in grid gap-3 rounded-2xl bg-card p-4 shadow-card">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-xl font-black">{{ localName(game) }}</span>
            <ReviewBadge class="animate-demo-pop" />
          </div>
          <span class="text-sm text-muted">{{
            $t('format.playersRange', { min: 2, max: 5 })
          }}</span>
          <div class="flex gap-2">
            <span
              v-for="m in ['coop', 'hand']"
              :key="m"
              class="h-6 w-20 rounded-full bg-mechanism/15"
            />
          </div>
        </div>
      </div>
      <DemoCursor
        :target="TARGETS[step] ?? null"
        :at="{ x: 0.6, y: 0.65 }"
        :press="acted && step !== 1"
      />
    </template>
  </DemoStage>

  <section class="grid gap-2">
    <h2 class="text-lg font-bold">{{ $t('help.pages.games.add.whereTitle') }}</h2>
    <p class="text-sm">{{ $t('help.pages.games.add.where') }}</p>
    <i18n-t keypath="addGame.slugHelp" tag="p" class="text-sm text-muted">
      <template #param><code>gamepanel?game=</code></template>
      <template #example>
        <code>boardgamearena.com/gamepanel?game=<b>hanabi</b></code>
      </template>
    </i18n-t>
  </section>

  <HelpTips
    :tips="[
      $t('help.pages.games.add.tips.review'),
      $t('help.pages.games.add.tips.exists'),
      $t('help.pages.games.add.tips.login'),
    ]"
  />
</template>
