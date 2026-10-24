<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useGame, useMyGameStats } from '../composables/catalog.ts'
import { formatDate, formatPlayers } from '../lib/format.ts'

const route = useRoute()
const id = computed(() => String(route.params.id))
const { data: game, isPending, error } = useGame(id)
const my = useMyGameStats()
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
      <header class="grid gap-1">
        <h1 class="text-2xl font-black">{{ game.name }}</h1>
        <p v-if="facts.length" class="text-muted">{{ facts.join(' · ') }}</p>
        <p class="text-sm text-muted">
          <template v-if="my.loggedIn">
            我玩過 {{ myStat?.playCount ?? 0 }} 次
            <template v-if="myStat?.lastPlayedAt">
              · 上次 {{ formatDate(myStat.lastPlayedAt) }}
            </template>
          </template>
          <template v-else>登入後顯示你的遊玩紀錄</template>
          · {{ myStat?.wished ? '★ 我想玩' : '☆ 還沒標想玩' }}
        </p>
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
              {{ p.displayName }}（{{ p.playCount }} 次）
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

      <section class="grid gap-2">
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
