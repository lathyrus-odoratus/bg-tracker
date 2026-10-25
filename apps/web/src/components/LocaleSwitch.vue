<script setup lang="ts">
import { locale } from '../i18n/index.ts'

/** 中文 ↔ 英文；按鈕上寫的是切過去的語言 */
function toggle() {
  locale.value = locale.value === 'zh-TW' ? 'en' : 'zh-TW'
}
</script>

<template>
  <button
    type="button"
    class="flex h-8 min-w-8 items-center justify-center rounded-full border border-line px-2 text-sm font-medium text-muted hover:text-ink"
    :aria-label="$t('locale.switchLabel')"
    :title="$t('locale.switchLabel')"
    :lang="locale === 'zh-TW' ? 'en' : 'zh-Hant'"
    @click="toggle"
  >
    {{ $t('locale.switchTo') }}
  </button>
</template>
