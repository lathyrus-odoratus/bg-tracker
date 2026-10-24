<script setup lang="ts">
import CircleGraph from '../components/CircleGraph.vue'
import TopWishes from '../components/TopWishes.vue'
import { useGraph, useMyGameStats } from '../composables/catalog.ts'

const { data: graph, isPending, isError } = useGraph()
const my = useMyGameStats()
</script>

<template>
  <div class="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_16rem]">
    <section class="grid min-w-0 content-start gap-3">
      <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h1 class="text-2xl font-black">遊戲與機制</h1>
        <ul class="flex gap-4 text-sm text-muted" aria-label="圖例">
          <li class="flex items-center gap-1.5">
            <span class="size-2.5 rounded-full bg-game" />遊戲（右半圈）
          </li>
          <li class="flex items-center gap-1.5">
            <span class="size-2.5 rounded-full bg-mechanism" />機制（左半圈）
          </li>
        </ul>
      </div>
      <p v-if="isPending" class="text-muted">載入中…</p>
      <p v-else-if="isError" class="text-danger">載入失敗，請重新整理。</p>
      <p v-else-if="graph && graph.games.length === 0" class="text-muted">還沒有任何遊戲。</p>
      <CircleGraph v-else-if="graph" :graph="graph" :my="my" />
      <p class="text-sm text-muted">
        也可以用列表瀏覽：
        <RouterLink to="/games" class="text-accent">全部遊戲</RouterLink> ·
        <RouterLink to="/mechanisms" class="text-accent">全部機制</RouterLink>
      </p>
    </section>
    <aside>
      <TopWishes />
    </aside>
  </div>
</template>
