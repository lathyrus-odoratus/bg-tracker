<script setup lang="ts">
import { computed } from 'vue'
import type { GameListItem } from '@bg-tracker/shared'
import GameCover from './GameCover.vue'
import type { Selection } from './CircleGraph.vue'
import { byLocalName, localName } from '../i18n/index.ts'

/** 圓形圖旁邊的遊戲圖示格子：只放圖示，名稱 hover／focus 時才顯示；順序和圖上一樣 */
const props = defineProps<{ games: GameListItem[]; selectedId: string | null }>()
const emit = defineEmits<{ select: [Selection]; hover: [Selection | null] }>()

const sorted = computed(() => [...props.games].sort(byLocalName))
</script>

<template>
  <ul
    class="grid grid-cols-[repeat(auto-fill,minmax(2.75rem,1fr))] gap-1.5"
    :aria-label="$t('nav.games')"
  >
    <li v-for="g in sorted" :key="g.id" class="group relative">
      <button
        type="button"
        class="block rounded-lg ring-offset-2 ring-offset-bg transition hover:ring-2 hover:ring-game focus-visible:ring-2 focus-visible:ring-game focus-visible:outline-none"
        :class="{ 'ring-2 ring-ink': g.id === selectedId }"
        :aria-label="localName(g)"
        :aria-pressed="g.id === selectedId"
        @click="emit('select', { kind: 'game', id: g.id })"
        @pointerenter="emit('hover', { kind: 'game', id: g.id })"
        @pointerleave="emit('hover', null)"
        @focus="emit('hover', { kind: 'game', id: g.id })"
        @blur="emit('hover', null)"
      >
        <GameCover :game="g" kind="icon" width="2.75rem" />
      </button>
      <!-- 名稱：hover／鍵盤 focus 時顯示在圖示右邊 -->
      <span
        class="pointer-events-none absolute top-1/2 left-full z-10 ml-2 hidden -translate-y-1/2 rounded-md bg-ink px-2 py-1 text-xs whitespace-nowrap text-bg shadow-card group-hover:block group-has-focus-visible:block"
        aria-hidden="true"
      >
        {{ localName(g) }}
      </span>
    </li>
  </ul>
</template>
