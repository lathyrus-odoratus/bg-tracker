<script setup lang="ts">
/** 篇末的「小提醒」 */
defineProps<{ tips: string[] }>()
</script>

<template>
  <section class="grid gap-2">
    <h2 class="text-lg font-bold">{{ $t('help.tips') }}</h2>
    <ul class="grid gap-1.5 text-sm">
      <li v-for="tip in tips" :key="tip" class="flex gap-2">
        <span class="text-accent" aria-hidden="true">•</span>
        <span>{{ tip }}</span>
      </li>
    </ul>
  </section>
</template>
