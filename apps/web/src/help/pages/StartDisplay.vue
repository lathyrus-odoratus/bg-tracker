<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { locale, type Locale } from '../../i18n/index.ts'
import DemoStage from '../DemoStage.vue'
import DemoCover from '../DemoCover.vue'
import DemoCursor from '../DemoCursor.vue'
import HelpTips from '../HelpTips.vue'
import { sampleGame } from '../samples.ts'

const { t } = useI18n()

/** 示意畫面切到另一個語言：文字直接指定 locale 取，不動到真的介面語言 */
const other = computed<Locale>(() => (locale.value === 'zh-TW' ? 'en' : 'zh-TW'))
const shown = (done: (i: number) => boolean) => (done(0) ? other.value : locale.value)
const game = sampleGame('azul')
const gameName = (l: Locale) => (l === 'en' ? game.nameEn : game.name)

/**
 * 深色只套在示意畫面裡：直接蓋掉這一塊的色彩 token（值同 style.css 的深色）。
 * 真的頁面是在 <html> 上切 data-theme
 */
const DARK = {
  '--bg': '#141412',
  '--card': '#1e1d1a',
  '--ink': '#ece8e1',
  '--muted': '#a39d93',
  '--line': '#2e2c28',
  '--accent': '#6cc2a8',
  '--accent-ink': '#0f1f1a',
}
const ICONS = { light: '☀', dark: '☾', system: '◐' }
const TARGETS = ['[data-locale]', '[data-appearance="dark"]', '[data-appearance="system"]']
/** 選了哪個外觀：第 2 步選深色、第 3 步選跟系統（示意裡的系統是淺色） */
const appearance = (done: (i: number) => boolean) =>
  done(2) ? 'system' : done(1) ? 'dark' : 'system'
</script>

<template>
  <p>{{ $t('help.pages.start.display.intro') }}</p>

  <DemoStage
    :steps="[
      $t('help.pages.start.display.steps.locale'),
      $t('help.pages.start.display.steps.dark'),
      $t('help.pages.start.display.steps.system'),
    ]"
  >
    <template #default="{ step, acted, done }">
      <div
        class="mx-auto grid max-w-md gap-3 rounded-2xl bg-bg p-3 text-ink transition-colors duration-500"
        :style="appearance(done) === 'dark' ? DARK : undefined"
      >
        <div
          class="flex items-center justify-between gap-2 rounded-xl bg-card px-3 py-2 shadow-card"
        >
          <span class="text-sm font-black">{{ t('app.title', {}, { locale: shown(done) }) }}</span>
          <span class="flex items-center gap-2">
            <span
              data-locale
              class="flex h-7 min-w-7 items-center justify-center rounded-full border border-line px-2 text-xs font-medium text-muted"
              >{{ t('locale.switchTo', {}, { locale: shown(done) }) }}</span
            >
            <span class="flex rounded-full border border-line p-0.5 text-xs">
              <span
                v-for="(icon, key) in ICONS"
                :key="key"
                :data-appearance="key"
                class="flex size-6 items-center justify-center rounded-full"
                :class="appearance(done) === key ? 'bg-ink text-bg' : 'text-muted'"
                >{{ icon }}</span
              >
            </span>
          </span>
        </div>
        <div class="flex items-center gap-3 rounded-xl bg-card p-3 shadow-card">
          <DemoCover :id="game.id" />
          <div class="grid">
            <span class="font-bold">{{ gameName(shown(done)) }}</span>
            <span class="text-xs text-muted">{{
              t('format.playersRange', { min: 2, max: 4 }, { locale: shown(done) })
            }}</span>
          </div>
          <span class="ml-auto text-xs text-muted">{{
            t('nav.mechanisms', {}, { locale: shown(done) })
          }}</span>
        </div>
      </div>
      <DemoCursor :target="TARGETS[step] ?? null" :press="acted" />
    </template>
  </DemoStage>

  <HelpTips
    :tips="[
      $t('help.pages.start.display.tips.names'),
      $t('help.pages.start.display.tips.default'),
      $t('help.pages.start.display.tips.browser'),
      $t('help.pages.start.display.tips.notThemes'),
    ]"
  />
</template>
