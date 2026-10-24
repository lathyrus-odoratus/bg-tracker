<script setup lang="ts">
import { computed } from 'vue'
import { useGame, type useMyGameStats } from '../composables/catalog.ts'
import { formatDate, formatPlayers } from '../lib/format.ts'
import type { Selection } from './CircleGraph.vue'
import GameCover from './GameCover.vue'
import MarkToggles from './MarkToggles.vue'
import ReviewBadge from './ReviewBadge.vue'
import { bgaGameUrl } from '../lib/bga.ts'

const props = defineProps<{ id: string; my: ReturnType<typeof useMyGameStats>['value'] }>()
const emit = defineEmits<{ select: [Selection]; close: [] }>()

/** 面板只列最近幾場，其餘到遊戲頁看 */
const RECENT_PLAYS = 3

const { data: game, isPending, error } = useGame(() => props.id)
const stat = computed(() => props.my.stats.get(props.id))
const facts = computed(() =>
  game.value
    ? [
        formatPlayers(game.value.minPlayers, game.value.maxPlayers),
        game.value.playMinutes && `約 ${game.value.playMinutes} 分鐘`,
      ].filter(Boolean)
    : [],
)
</script>

<template>
  <article class="grid content-start gap-4">
    <header class="flex items-start gap-3">
      <GameCover v-if="game" :game="game" kind="box280" width="6rem" />
      <div class="grid min-w-0 flex-1 gap-0.5">
        <span class="flex items-center gap-1.5 text-xs font-medium text-muted">
          <span class="size-2 rounded-full bg-game" />遊戲
        </span>
        <h2 class="text-xl font-black">{{ game?.name ?? '…' }}</h2>
        <ReviewBadge v-if="game?.needsReview" class="justify-self-start" />
        <p v-if="facts.length" class="text-sm text-muted">{{ facts.join(' · ') }}</p>
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
    <template v-else-if="game">
      <MarkToggles :game-id="game.id" :stat="stat" />
      <p class="text-sm text-muted">
        重度
        <template v-if="game.weight.average !== null">
          <span class="font-bold text-ink tabular-nums">{{ game.weight.average.toFixed(1) }}</span>
          （{{ game.weight.count }} 人評分<template v-if="game.weight.mine !== null"
            >，我 {{ game.weight.mine.toFixed(1) }}</template
          >）
        </template>
        <template v-else>還沒有人評</template>
      </p>
      <p v-if="stat?.lastPlayedAt" class="text-sm text-muted">
        上次遊玩 {{ formatDate(stat.lastPlayedAt) }}
      </p>

      <section class="grid gap-1.5">
        <h3 class="text-sm font-bold">用到的機制</h3>
        <p v-if="!game.mechanisms.length" class="text-sm text-muted">還沒有對應任何機制。</p>
        <ul v-else class="flex flex-wrap gap-1.5">
          <li v-for="m in game.mechanisms" :key="m.id">
            <button
              type="button"
              class="flex items-center gap-1.5 rounded-full border border-line px-2.5 py-0.5 text-sm hover:border-mechanism"
              @click="emit('select', { kind: 'mechanism', id: m.id })"
            >
              <span class="size-2 rounded-full bg-mechanism" />{{ m.name }}
            </button>
          </li>
        </ul>
      </section>

      <section class="grid gap-1.5">
        <h3 class="text-sm font-bold">最近的遊玩紀錄</h3>
        <p v-if="!game.plays.length" class="text-sm text-muted">還沒有紀錄。</p>
        <ul v-else class="grid gap-1 text-sm">
          <li v-for="p in game.plays.slice(0, RECENT_PLAYS)" :key="p.id" class="flex gap-2">
            <span class="flex-none tabular-nums">{{ formatDate(p.playedAt) }}</span>
            <span class="min-w-0 truncate text-muted">
              {{ p.participants.map((pp) => pp.user?.displayName ?? pp.externalName).join('、') }}
            </span>
          </li>
        </ul>
      </section>

      <nav class="grid gap-2 border-t border-line pt-3 text-sm font-medium">
        <RouterLink :to="`/games/${game.id}`" class="text-accent hover:underline">
          遊戲頁：機制、誰玩過、誰想玩 →
        </RouterLink>
        <RouterLink :to="`/games/${game.id}#plays`" class="text-accent hover:underline">
          全部遊玩紀錄（{{ game.plays.length }} 筆）→
        </RouterLink>
        <a
          v-if="game.bgaSlug"
          :href="bgaGameUrl(game.bgaSlug)"
          target="_blank"
          rel="noopener"
          class="text-accent hover:underline"
        >
          在 BGA 上玩 ↗
        </a>
      </nav>
    </template>
  </article>
</template>
