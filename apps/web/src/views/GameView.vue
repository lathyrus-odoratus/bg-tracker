<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useGame, useMyGameStats } from '../composables/catalog.ts'
import { useSessionStore } from '../stores/session.ts'
import { formatDate, formatPlayers } from '../lib/format.ts'
import { bgaGameUrl } from '../lib/bga.ts'
import GameCover from '../components/GameCover.vue'
import MarkToggles from '../components/MarkToggles.vue'

const route = useRoute()
const id = computed(() => String(route.params.id))
const { data: game, isPending, error } = useGame(id)
const my = useMyGameStats()
const session = useSessionStore()
const myStat = computed(() => my.value.stats.get(id.value))
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
  <section class="mx-auto grid max-w-3xl gap-6">
    <p v-if="isPending" class="text-muted">載入中…</p>
    <p v-else-if="error" class="text-danger">找不到這款遊戲。</p>
    <template v-else-if="game">
      <GameCover v-if="game.bgaSlug && !game.imageUrl" :game="game" kind="bannerTitle" />
      <header class="flex flex-wrap items-start gap-5">
        <GameCover :game="game" kind="box280" width="10rem" />
        <div class="grid min-w-60 flex-1 content-start gap-1">
          <div class="flex items-baseline justify-between gap-3">
            <h1 class="text-2xl font-black">{{ game.name }}</h1>
            <RouterLink
              v-if="session.isAdmin"
              :to="`/admin/games/${game.id}/edit`"
              class="text-sm font-medium text-accent"
            >
              編輯
            </RouterLink>
          </div>
          <p v-if="facts.length" class="text-muted">{{ facts.join(' · ') }}</p>
          <MarkToggles :game-id="game.id" :stat="myStat" class="mt-1" />
          <p v-if="myStat?.lastPlayedAt" class="text-sm text-muted">
            上次遊玩 {{ formatDate(myStat.lastPlayedAt) }}
          </p>
          <p class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm font-medium">
            <a
              v-if="game.bgaSlug"
              :href="bgaGameUrl(game.bgaSlug)"
              target="_blank"
              rel="noopener"
              class="text-accent hover:underline"
            >
              在 BGA 上玩 ↗
            </a>
            <a
              v-if="game.bggId"
              :href="`https://boardgamegeek.com/boardgame/${game.bggId}`"
              target="_blank"
              rel="noopener"
              class="text-accent hover:underline"
            >
              BGG 頁面 ↗
            </a>
          </p>
        </div>
      </header>

      <section class="grid gap-2">
        <h2 class="font-bold">用到的機制</h2>
        <p v-if="!game.mechanisms.length" class="text-sm text-muted">還沒有對應任何機制。</p>
        <ul v-else class="flex flex-wrap gap-2">
          <li v-for="m in game.mechanisms" :key="m.id">
            <RouterLink
              :to="`/mechanisms/${m.id}`"
              class="flex items-center gap-1.5 rounded-full border border-line bg-card px-3 py-1 text-sm hover:underline"
            >
              <span class="size-2 rounded-full bg-mechanism" />{{ m.name }}
            </RouterLink>
          </li>
        </ul>
      </section>

      <section class="grid gap-2 sm:grid-cols-2">
        <div class="grid content-start gap-1">
          <h2 class="font-bold">誰玩過</h2>
          <p v-if="!game.players.length" class="text-sm text-muted">還沒有人。</p>
          <ul v-else class="text-sm">
            <li v-for="p in game.players" :key="p.id">
              {{ p.displayName }}<template v-if="p.playCount">（{{ p.playCount }} 次）</template>
            </li>
          </ul>
        </div>
        <div class="grid content-start gap-1">
          <h2 class="font-bold">誰想玩</h2>
          <p v-if="!game.wishers.length" class="text-sm text-muted">還沒有人。</p>
          <ul v-else class="text-sm">
            <li v-for="w in game.wishers" :key="w.id">{{ w.displayName }}</li>
          </ul>
        </div>
      </section>

      <section id="plays" class="grid scroll-mt-4 gap-2">
        <h2 class="font-bold">遊玩紀錄</h2>
        <p v-if="!game.plays.length" class="text-sm text-muted">還沒有紀錄。</p>
        <ul v-else class="grid gap-2">
          <li
            v-for="p in game.plays"
            :key="p.id"
            class="grid gap-1 rounded-xl bg-card px-4 py-3 shadow-card"
          >
            <div class="flex items-baseline justify-between gap-3 text-sm">
              <span class="font-bold">{{ formatDate(p.playedAt) }}</span>
              <a
                v-if="p.source === 'bga' && p.externalId"
                :href="`https://boardgamearena.com/table?table=${p.externalId}`"
                target="_blank"
                rel="noopener"
                class="text-accent"
              >
                BGA #{{ p.externalId }}
              </a>
            </div>
            <ol class="flex flex-wrap gap-x-4 text-sm text-muted">
              <li v-for="pp in p.participants" :key="pp.externalName">
                <template v-if="pp.rank">{{ pp.rank }}. </template>
                <span :class="{ 'text-ink': pp.user }">{{
                  pp.user?.displayName ?? pp.externalName
                }}</span>
                <template v-if="pp.score !== null">（{{ pp.score }}）</template>
              </li>
            </ol>
          </li>
        </ul>
      </section>
    </template>
  </section>
</template>
