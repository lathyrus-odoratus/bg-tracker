<script setup lang="ts">
/** 示意的一則留言（樣子同 PostItem，作者頭像用字母代替） */
defineProps<{
  number: number
  author: string
  time: string
  replyTo?: number
  highlighted?: boolean
}>()
</script>

<template>
  <article
    class="grid gap-1 rounded-xl bg-card px-3 py-2 shadow-card transition-shadow duration-300"
    :class="{ 'ring-2 ring-accent': highlighted }"
  >
    <header class="flex flex-wrap items-center gap-x-2.5 text-xs">
      <span class="font-bold tabular-nums">#{{ number }}</span>
      <span class="flex items-center gap-1">
        <span
          class="flex size-4 items-center justify-center rounded-full bg-game text-[9px] font-bold text-white"
          >{{ author.slice(0, 1) }}</span
        >{{ author }}
      </span>
      <span class="text-muted tabular-nums">{{ time }}</span>
      <span v-if="replyTo" data-reply-link class="text-accent">{{
        $t('board.replyTo', { n: replyTo })
      }}</span>
      <slot name="meta" />
    </header>
    <slot />
  </article>
</template>
