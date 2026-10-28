<script setup lang="ts">
import { DISPLAY_NAME_MAX } from '@bg-tracker/shared'
import DemoStage from '../DemoStage.vue'
import DemoCursor from '../DemoCursor.vue'
import DemoHeader from '../DemoHeader.vue'
import HelpTips from '../HelpTips.vue'
import TypedText from '../TypedText.vue'
import { SAMPLE_DISCORD_NAME, SAMPLE_NICKNAME } from '../samples.ts'

/** 頁首的名字：存檔後換成新暱稱，重設後換回 Discord 名稱 */
const headerName = (done: (i: number) => boolean) =>
  done(2) && !done(3) ? SAMPLE_NICKNAME : SAMPLE_DISCORD_NAME
const TARGETS = ['[data-avatar]', '[data-name]', '[data-save]', '[data-reset]']
</script>

<template>
  <p>{{ $t('help.pages.account.nickname.intro') }}</p>

  <DemoStage
    :steps="[
      $t('help.pages.account.nickname.steps.open'),
      $t('help.pages.account.nickname.steps.type'),
      $t('help.pages.account.nickname.steps.save'),
      $t('help.pages.account.nickname.steps.reset'),
    ]"
  >
    <template #default="{ step, acted, done }">
      <div class="mx-auto grid h-60 max-w-md content-start gap-4">
        <DemoHeader :name="headerName(done)" />
        <div v-if="!done(0)" class="grid grid-cols-3 gap-2">
          <div v-for="n in 3" :key="n" class="h-16 rounded-xl bg-card shadow-card" />
        </div>
        <div v-else class="animate-demo-in grid gap-2 rounded-2xl bg-card p-4 shadow-card">
          <span class="text-sm font-bold">{{ $t('settings.displayName') }}</span>
          <div class="flex gap-2">
            <span
              data-name
              class="h-10 min-w-0 flex-1 rounded-xl border bg-bg px-3 py-2"
              :class="step === 1 ? 'border-accent' : 'border-line'"
            >
              <template v-if="!done(1) || done(3)">{{ SAMPLE_DISCORD_NAME }}</template>
              <TypedText v-else :text="SAMPLE_NICKNAME" :mode="step === 1 ? 'typing' : 'full'" />
            </span>
            <span
              data-save
              class="flex-none rounded-xl bg-accent px-4 py-2 font-bold text-accent-ink"
              :class="{ 'opacity-50': !done(1) || done(2) }"
              >{{ $t('common.save') }}</span
            >
          </div>
          <span class="text-xs text-muted">{{
            $t('settings.displayNameHelp', { max: DISPLAY_NAME_MAX })
          }}</span>
          <span class="flex h-5 items-center gap-3 text-sm">
            <span v-if="done(2) && !done(3)" data-reset class="text-accent">{{
              $t('settings.resetToDiscord', { name: SAMPLE_DISCORD_NAME })
            }}</span>
            <span v-if="done(2)" class="animate-demo-in text-muted">{{
              $t('settings.saved')
            }}</span>
          </span>
        </div>
      </div>
      <DemoCursor
        :target="TARGETS[step] ?? null"
        :at="{ x: 0.5, y: 0.6 }"
        :press="acted && step !== 1"
      />
    </template>
  </DemoStage>

  <HelpTips
    :tips="[
      $t('help.pages.account.nickname.tips.where'),
      $t('help.pages.account.nickname.tips.unique'),
      $t('help.pages.account.nickname.tips.login'),
    ]"
  />
</template>
