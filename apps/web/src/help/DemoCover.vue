<script setup lang="ts">
import { SAMPLE_EMOJI } from './samples.ts'

/** 示意的遊戲圖：底色加 emoji；`banner` 是遊戲列表的橫幅樣式 */
withDefaults(defineProps<{ id: string; size?: 'sm' | 'md' | 'lg' | 'banner' }>(), { size: 'md' })
</script>

<template>
  <span
    class="flex flex-none items-center justify-center bg-game/15 transition-all duration-500"
    :class="{
      'size-5 rounded text-xs': size === 'sm',
      'size-10 rounded-lg text-xl': size === 'md',
      'size-16 rounded-xl text-3xl': size === 'lg',
      'h-10 w-24 rounded-lg text-xl': size === 'banner',
    }"
    >{{ SAMPLE_EMOJI[id] }}</span
  >
</template>
