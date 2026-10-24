<script setup lang="ts">
import { THEMES, useTheme, type Theme } from '../composables/theme.ts'

const theme = useTheme()
const LABELS: Record<Theme, { icon: string; label: string }> = {
  light: { icon: '☀', label: '淺色' },
  dark: { icon: '☾', label: '深色' },
  system: { icon: '◐', label: '跟系統' },
}
</script>

<template>
  <fieldset class="flex rounded-full border border-line p-0.5 text-sm" aria-label="主題">
    <label
      v-for="t in THEMES"
      :key="t"
      class="flex size-7 cursor-pointer items-center justify-center rounded-full has-focus-visible:outline-2 has-focus-visible:outline-accent"
      :class="theme === t ? 'bg-ink text-bg' : 'text-muted hover:text-ink'"
      :title="LABELS[t].label"
    >
      <input v-model="theme" type="radio" name="theme" :value="t" class="sr-only" />
      <span aria-hidden="true">{{ LABELS[t].icon }}</span>
      <span class="sr-only">{{ LABELS[t].label }}</span>
    </label>
  </fieldset>
</template>
