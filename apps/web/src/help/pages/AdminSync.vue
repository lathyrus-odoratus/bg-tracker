<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { localName } from '../../i18n/index.ts'
import DemoStage from '../DemoStage.vue'
import DemoCover from '../DemoCover.vue'
import DemoCursor from '../DemoCursor.vue'
import HelpTips from '../HelpTips.vue'
import { SAMPLE_GRAPH } from '../samples.ts'

const { t } = useI18n()
const ROWS = SAMPLE_GRAPH.games.slice(0, 3)
/** 同步結果的訊息（組法同遊戲列表頁） */
const result = () =>
  [t('games.synced', 12), t('games.syncMissing', { slugs: 'myhomebrew' })].join(
    t('common.sentenceSep'),
  )
const TARGETS = ['[data-sync]', '[data-ok]', null]
</script>

<template>
  <p>{{ $t('help.pages.admin.sync.intro') }}</p>

  <DemoStage
    :steps="[
      $t('help.pages.admin.sync.steps.open'),
      $t('help.pages.admin.sync.steps.confirm'),
      $t('help.pages.admin.sync.steps.result'),
    ]"
    :durations="[2400, 2600, 3200]"
  >
    <template #default="{ step, acted, done }">
      <div class="relative mx-auto grid h-60 max-w-md content-start gap-2">
        <div class="flex items-baseline justify-between gap-3">
          <span class="text-lg font-black">{{ $t('games.title') }}</span>
          <span class="flex items-baseline gap-3 text-xs font-medium">
            <span data-sync :class="done(1) && !done(2) ? 'text-muted opacity-50' : 'text-muted'">{{
              done(1) && !done(2) ? $t('games.syncing') : $t('games.sync')
            }}</span>
            <span class="text-accent">{{ $t('games.add') }}</span>
          </span>
        </div>
        <p v-if="done(2)" class="animate-demo-in text-xs text-muted">{{ result() }}</p>
        <div
          v-for="g in ROWS"
          :key="g.id"
          class="flex items-center gap-3 rounded-xl bg-card px-3 py-2 shadow-card"
        >
          <DemoCover :id="g.id" />
          <span class="font-bold">{{ localName(g) }}</span>
        </div>

        <!-- 瀏覽器的確認對話框：只畫個大概 -->
        <div
          v-if="done(0) && !done(1)"
          class="animate-demo-in absolute -inset-2 flex items-center justify-center rounded-xl bg-ink/20"
        >
          <div class="grid max-w-xs gap-3 rounded-xl bg-card p-4 text-xs shadow-card">
            <p>{{ $t('games.syncConfirm') }}</p>
            <span class="flex justify-end gap-2">
              <span class="rounded-md border border-line px-3 py-1">{{ $t('common.cancel') }}</span>
              <span data-ok class="rounded-md bg-accent px-3 py-1 font-bold text-accent-ink">{{
                $t('help.pages.admin.sync.ok')
              }}</span>
            </span>
          </div>
        </div>
      </div>
      <DemoCursor :target="TARGETS[step] ?? null" :at="{ x: 0.4 }" :press="acted" />
    </template>
  </DemoStage>

  <HelpTips
    :tips="[
      $t('help.pages.admin.sync.tips.scope'),
      $t('help.pages.admin.sync.tips.newTags'),
      $t('help.pages.admin.sync.tips.nameEn'),
      $t('help.pages.admin.sync.tips.single'),
    ]"
  />
</template>
