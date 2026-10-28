<script setup lang="ts">
/** 示意用的頁首：登入後右上角是頭像與暱稱 */
defineProps<{ name: string | null }>()
</script>

<template>
  <div class="flex items-center justify-between gap-3 rounded-xl bg-card px-3 py-2 shadow-card">
    <span class="text-sm font-black">{{ $t('app.title') }}</span>
    <span v-if="name" data-avatar class="flex items-center gap-2">
      <span
        class="flex size-7 items-center justify-center rounded-full bg-game text-xs font-bold text-white"
        >{{ name.slice(0, 1).toUpperCase() }}</span
      >
      <span class="text-sm font-medium">{{ name }}</span>
    </span>
  </div>
</template>
