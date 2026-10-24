<script setup lang="ts">
import { useTopWishes } from '../composables/catalog.ts'

const props = defineProps<{ k?: number }>()
const { data, isPending, isError } = useTopWishes(props.k ?? 10)
</script>

<template>
  <section class="grid content-start gap-3 rounded-2xl bg-card p-4 shadow-card">
    <h2 class="font-bold">大家想玩</h2>
    <p v-if="isPending" class="text-sm text-muted">載入中…</p>
    <p v-else-if="isError" class="text-sm text-danger">載入失敗</p>
    <p v-else-if="!data?.length" class="text-sm text-muted">還沒有人標想玩。</p>
    <ol v-else class="grid gap-1">
      <li v-for="(w, i) in data" :key="w.gameId" class="flex items-baseline gap-2 text-sm">
        <span class="w-5 flex-none text-right text-muted tabular-nums">{{ i + 1 }}</span>
        <RouterLink :to="`/games/${w.gameId}`" class="min-w-0 flex-1 truncate hover:underline">
          {{ w.name }}
        </RouterLink>
        <span class="flex-none text-muted tabular-nums">{{ w.count }} 人</span>
      </li>
    </ol>
  </section>
</template>
