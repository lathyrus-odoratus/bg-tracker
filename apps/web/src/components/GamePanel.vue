<script setup lang="ts">
import { computed } from 'vue'
import { useGame, type useMyGameStats } from '../composables/catalog.ts'
import { formatDate, formatPlayers } from '../lib/format.ts'
import type { Selection } from './CircleGraph.vue'
import GameCover from './GameCover.vue'
import MarkToggles from './MarkToggles.vue'
import ReviewBadge from './ReviewBadge.vue'
import { bgaGameUrl } from '../lib/bga.ts'
import { localName, t } from '../i18n/index.ts'

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
        game.value.playMinutes && t('format.aboutMinutes', { n: game.value.playMinutes }),
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
          <span class="size-2 rounded-full bg-game" />{{ $t('nav.games') }}
        </span>
        <h2 class="text-xl font-black">{{ game ? localName(game) : '…' }}</h2>
        <ReviewBadge v-if="game?.needsReview" class="justify-self-start" />
        <p v-if="facts.length" class="text-sm text-muted">{{ facts.join(' · ') }}</p>
      </div>
      <button
        type="button"
        class="text-muted hover:text-ink"
        :aria-label="$t('common.close')"
        @click="emit('close')"
      >
        ✕
      </button>
    </header>

    <p v-if="isPending" class="text-sm text-muted">{{ $t('common.loading') }}</p>
    <p v-else-if="error" class="text-sm text-danger">{{ $t('common.loadFailed') }}</p>
    <template v-else-if="game">
      <MarkToggles :game-id="game.id" :stat="stat" />
      <p class="text-sm text-muted">
        {{ $t('weight.short') }}
        <template v-if="game.weight.average !== null">
          <span class="font-bold text-ink tabular-nums">{{ game.weight.average.toFixed(1) }}</span>
          {{
            game.weight.mine !== null
              ? $t(
                  'weight.ratingsWithMine',
                  { n: game.weight.count, mine: game.weight.mine.toFixed(1) },
                  game.weight.count,
                )
              : $t('weight.ratings', game.weight.count)
          }}
        </template>
        <template v-else>{{ $t('weight.noRatings') }}</template>
      </p>
      <p v-if="stat?.lastPlayedAt" class="text-sm text-muted">
        {{ $t('game.lastPlayed', { date: formatDate(stat.lastPlayedAt) }) }}
      </p>

      <section class="grid gap-1.5">
        <h3 class="text-sm font-bold">{{ $t('game.mechanisms') }}</h3>
        <p v-if="!game.mechanisms.length" class="text-sm text-muted">
          {{ $t('game.noMechanisms') }}
        </p>
        <ul v-else class="flex flex-wrap gap-1.5">
          <li v-for="m in game.mechanisms" :key="m.id">
            <button
              type="button"
              class="flex items-center gap-1.5 rounded-full border border-line px-2.5 py-0.5 text-sm hover:border-mechanism"
              @click="emit('select', { kind: 'mechanism', id: m.id })"
            >
              <span class="size-2 rounded-full bg-mechanism" />{{ localName(m) }}
            </button>
          </li>
        </ul>
      </section>

      <section class="grid gap-1.5">
        <h3 class="text-sm font-bold">{{ $t('gamePanel.recentPlays') }}</h3>
        <p v-if="!game.plays.length" class="text-sm text-muted">{{ $t('game.noPlays') }}</p>
        <ul v-else class="grid gap-1 text-sm">
          <li v-for="p in game.plays.slice(0, RECENT_PLAYS)" :key="p.id" class="flex gap-2">
            <span class="flex-none tabular-nums">{{ formatDate(p.playedAt) }}</span>
            <span class="min-w-0 truncate text-muted">
              {{
                p.participants
                  .map((pp) => pp.user?.displayName ?? pp.externalName)
                  .join($t('common.listSep'))
              }}
            </span>
          </li>
        </ul>
      </section>

      <nav class="grid gap-2 border-t border-line pt-3 text-sm font-medium">
        <RouterLink :to="`/games/${game.id}`" class="text-accent hover:underline">
          {{ $t('gamePanel.toGame') }}
        </RouterLink>
        <RouterLink :to="`/games/${game.id}#plays`" class="text-accent hover:underline">
          {{ $t('gamePanel.allPlays', { n: game.plays.length }) }}
        </RouterLink>
        <a
          v-if="game.bgaSlug"
          :href="bgaGameUrl(game.bgaSlug)"
          target="_blank"
          rel="noopener"
          class="text-accent hover:underline"
        >
          {{ $t('common.playBga') }}
        </a>
      </nav>
    </template>
  </article>
</template>
