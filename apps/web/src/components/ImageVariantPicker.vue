<script setup lang="ts">
import { BGA_IMAGES } from '../lib/bga.ts'
import { LIST_IMAGE_OPTIONS, useListImage } from '../composables/image-variant.ts'

const listImage = useListImage()
</script>

<template>
  <fieldset class="flex flex-wrap items-center gap-1.5 text-sm">
    <legend class="sr-only">列表的遊戲圖</legend>
    <span class="mr-1 text-muted">列表圖片（試用）：</span>
    <label
      v-for="key in LIST_IMAGE_OPTIONS"
      :key="key"
      class="cursor-pointer rounded-full border px-2.5 py-0.5"
      :class="listImage === key ? 'border-ink bg-ink text-bg' : 'border-line text-muted'"
    >
      <input v-model="listImage" type="radio" :value="key" class="sr-only" />
      {{ BGA_IMAGES[key].label }}
    </label>
  </fieldset>
</template>
