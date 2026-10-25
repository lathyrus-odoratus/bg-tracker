<script setup lang="ts">
import { THEMES, useTheme, type Theme } from '../composables/theme.ts'

/** 介面的亮暗（遊戲的「主題」標籤是另一回事，這裡叫「外觀」） */
const theme = useTheme()
const ICONS: Record<Theme, string> = { light: '☀', dark: '☾', system: '◐' }
</script>

<template>
  <fieldset
    class="flex rounded-full border border-line p-0.5 text-sm"
    :aria-label="$t('appearance.label')"
  >
    <label
      v-for="t in THEMES"
      :key="t"
      class="flex size-7 cursor-pointer items-center justify-center rounded-full has-focus-visible:outline-2 has-focus-visible:outline-accent"
      :class="theme === t ? 'bg-ink text-bg' : 'text-muted hover:text-ink'"
      :title="$t(`appearance.${t}`)"
    >
      <input v-model="theme" type="radio" name="theme" :value="t" class="sr-only" />
      <span aria-hidden="true">{{ ICONS[t] }}</span>
      <span class="sr-only">{{ $t(`appearance.${t}`) }}</span>
    </label>
  </fieldset>
</template>
