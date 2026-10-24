<script setup lang="ts">
import GameCover from './GameCover.vue'
import { useMechanism } from '../composables/catalog.ts'
import type { Selection } from './CircleGraph.vue'

const props = defineProps<{ id: string }>()
const emit = defineEmits<{ select: [Selection]; close: [] }>()

const { data: mechanism, isPending, error } = useMechanism(() => props.id)
</script>

<template>
  <article class="grid content-start gap-4">
    <header class="flex items-start justify-between gap-3">
      <div class="grid gap-0.5">
        <span class="flex items-center gap-1.5 text-xs font-medium text-muted">
          <span class="size-2 rounded-full bg-mechanism" />機制
        </span>
        <h2 class="text-xl font-black">{{ mechanism?.name ?? '…' }}</h2>
      </div>
      <button
        type="button"
        class="text-muted hover:text-ink"
        aria-label="關閉"
        @click="emit('close')"
      >
        ✕
      </button>
    </header>

    <p v-if="isPending" class="text-sm text-muted">載入中…</p>
    <p v-else-if="error" class="text-sm text-danger">載入失敗</p>
    <template v-else-if="mechanism">
      <p v-if="mechanism.description" class="text-sm">{{ mechanism.description }}</p>
      <section class="grid gap-1.5">
        <h3 class="text-sm font-bold">使用此機制的遊戲（{{ mechanism.games.length }}）</h3>
        <p v-if="!mechanism.games.length" class="text-sm text-muted">還沒有遊戲使用。</p>
        <ul v-else class="flex flex-wrap gap-1.5">
          <li v-for="g in mechanism.games" :key="g.id">
            <button
              type="button"
              class="flex items-center gap-1.5 rounded-full border border-line px-2.5 py-0.5 text-sm hover:border-game"
              @click="emit('select', { kind: 'game', id: g.id })"
            >
              <GameCover :game="g" kind="icon" height="1.25rem" small />{{ g.name }}
            </button>
          </li>
        </ul>
      </section>
      <nav class="border-t border-line pt-3 text-sm font-medium">
        <RouterLink :to="`/mechanisms/${mechanism.id}`" class="text-accent hover:underline">
          機制頁 →
        </RouterLink>
      </nav>
    </template>
  </article>
</template>
