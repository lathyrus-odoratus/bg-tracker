<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useGame, useMyGameStats } from '../composables/catalog.ts'
import { useSessionStore } from '../stores/session.ts'
import { formatDate, formatPlayers } from '../lib/format.ts'
import { bgaGameUrl } from '../lib/bga.ts'
import GameCover from '../components/GameCover.vue'
import MarkToggles from '../components/MarkToggles.vue'
import WeightSlider from '../components/WeightSlider.vue'
import ReviewBadge from '../components/ReviewBadge.vue'
import { api, ensureOk } from '../lib/api.ts'
import { errorMessage } from '../lib/form.ts'
import { useInvalidateCatalog } from '../composables/admin.ts'
import { localName, t } from '../i18n/index.ts'

const route = useRoute()
const id = computed(() => String(route.params.id))
const { data: game, isPending, error } = useGame(id)
const my = useMyGameStats()
const session = useSessionStore()
const invalidate = useInvalidateCatalog()

/** admin review：只是確認，清掉「需要 admin review」 */
const reviewing = ref(false)
const reviewError = ref('')
async function markReviewed() {
  reviewing.value = true
  reviewError.value = ''
  try {
    await ensureOk(api.admin.games[':id'].review.$post({ param: { id: id.value } }))
    await invalidate()
  } catch (err) {
    reviewError.value = errorMessage(err)
  } finally {
    reviewing.value = false
  }
}
const myStat = computed(() => my.value.stats.get(id.value))
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
  <section class="mx-auto grid max-w-3xl gap-6">
    <p v-if="isPending" class="text-muted">{{ $t('common.loading') }}</p>
    <p v-else-if="error" class="text-danger">{{ $t('game.notFound') }}</p>
    <template v-else-if="game">
      <GameCover v-if="game.bgaSlug && !game.imageUrl" :game="game" kind="bannerTitle" :ratio="2" />
      <header class="flex flex-wrap items-start gap-5">
        <GameCover :game="game" kind="box280" width="10rem" />
        <div class="grid min-w-60 flex-1 content-start gap-1">
          <div class="flex items-baseline justify-between gap-3">
            <h1 class="flex flex-wrap items-center gap-x-3 text-2xl font-black">
              {{ localName(game) }}
              <ReviewBadge v-if="game.needsReview" />
            </h1>
            <RouterLink
              v-if="session.isAdmin"
              :to="`/admin/games/${game.id}/edit`"
              class="text-sm font-medium text-accent"
            >
              {{ $t('common.edit') }}
            </RouterLink>
          </div>
          <p v-if="facts.length" class="text-muted">{{ facts.join(' · ') }}</p>
          <div
            v-if="game.needsReview && session.isAdmin"
            class="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-line px-3 py-2 text-sm"
          >
            <span class="text-muted">{{ $t('review.hint') }}</span>
            <RouterLink :to="`/admin/games/${game.id}/edit`" class="text-accent">{{
              $t('common.edit')
            }}</RouterLink>
            <button
              type="button"
              :disabled="reviewing"
              class="rounded-lg bg-ink px-3 py-0.5 font-bold text-bg disabled:opacity-50"
              @click="markReviewed"
            >
              {{ $t('review.confirm') }}
            </button>
            <span v-if="reviewError" class="text-danger" role="alert">{{ reviewError }}</span>
          </div>
          <MarkToggles :game-id="game.id" :stat="myStat" class="mt-1" />
          <p v-if="myStat?.lastPlayedAt" class="text-sm text-muted">
            {{ $t('game.lastPlayed', { date: formatDate(myStat.lastPlayedAt) }) }}
          </p>
          <p class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm font-medium">
            <a
              v-if="game.bgaSlug"
              :href="bgaGameUrl(game.bgaSlug)"
              target="_blank"
              rel="noopener"
              class="text-accent hover:underline"
            >
              {{ $t('common.playBga') }}
            </a>
            <a
              v-if="game.bggId"
              :href="`https://boardgamegeek.com/boardgame/${game.bggId}`"
              target="_blank"
              rel="noopener"
              class="text-accent hover:underline"
            >
              {{ $t('common.bggPage') }}
            </a>
          </p>
        </div>
      </header>

      <WeightSlider :key="game.id" :game-id="game.id" :weight="game.weight" />

      <section class="grid gap-2">
        <h2 class="font-bold">{{ $t('game.mechanisms') }}</h2>
        <p v-if="!game.mechanisms.length" class="text-sm text-muted">
          {{ $t('game.noMechanisms') }}
        </p>
        <ul v-else class="flex flex-wrap gap-2">
          <li v-for="m in game.mechanisms" :key="m.id">
            <RouterLink
              :to="`/mechanisms/${m.id}`"
              class="flex items-center gap-1.5 rounded-full border border-line bg-card px-3 py-1 text-sm hover:underline"
            >
              <span class="size-2 rounded-full bg-mechanism" />{{ localName(m) }}
            </RouterLink>
          </li>
        </ul>
      </section>

      <section class="grid gap-2">
        <h2 class="font-bold">{{ $t('game.themes') }}</h2>
        <p v-if="!game.themes.length" class="text-sm text-muted">{{ $t('game.noThemes') }}</p>
        <ul v-else class="flex flex-wrap gap-2">
          <li v-for="theme in game.themes" :key="theme.id">
            <RouterLink
              :to="`/themes/${theme.id}`"
              class="flex items-center gap-1.5 rounded-full border border-line bg-card px-3 py-1 text-sm hover:underline"
            >
              <span class="size-2 rounded-full bg-game-theme" />{{ localName(theme) }}
            </RouterLink>
          </li>
        </ul>
      </section>

      <section class="grid gap-2 sm:grid-cols-2">
        <div class="grid content-start gap-1">
          <h2 class="font-bold">{{ $t('game.players') }}</h2>
          <p v-if="!game.players.length" class="text-sm text-muted">{{ $t('game.nobody') }}</p>
          <ul v-else class="text-sm">
            <li v-for="p in game.players" :key="p.id">
              {{
                p.playCount
                  ? $t('game.playerWithCount', { name: p.displayName, n: p.playCount }, p.playCount)
                  : p.displayName
              }}
            </li>
          </ul>
        </div>
        <div class="grid content-start gap-1">
          <h2 class="font-bold">{{ $t('game.wishers') }}</h2>
          <p v-if="!game.wishers.length" class="text-sm text-muted">{{ $t('game.nobody') }}</p>
          <ul v-else class="text-sm">
            <li v-for="w in game.wishers" :key="w.id">{{ w.displayName }}</li>
          </ul>
        </div>
      </section>

      <section id="plays" class="grid scroll-mt-4 gap-2">
        <h2 class="font-bold">{{ $t('game.plays') }}</h2>
        <p v-if="!game.plays.length" class="text-sm text-muted">{{ $t('game.noPlays') }}</p>
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
