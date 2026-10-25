<script setup lang="ts">
import GameCover from '../components/GameCover.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useGameTheme } from '../composables/catalog.ts'
import { localName } from '../i18n/index.ts'

const route = useRoute()
const { data: theme, isPending, error } = useGameTheme(computed(() => String(route.params.id)))
</script>

<template>
  <section class="mx-auto grid max-w-3xl gap-6">
    <p v-if="isPending" class="text-muted">{{ $t('common.loading') }}</p>
    <p v-else-if="error" class="text-danger">{{ $t('themes.notFound') }}</p>
    <template v-else-if="theme">
      <h1 class="flex items-center gap-2 text-2xl font-black">
        <span class="size-3 rounded-full bg-game-theme" />{{ localName(theme) }}
      </h1>
      <section class="grid gap-2">
        <h2 class="font-bold">{{ $t('themes.games') }}</h2>
        <p v-if="!theme.games.length" class="text-sm text-muted">{{ $t('themes.noGames') }}</p>
        <ul v-else class="flex flex-wrap gap-2">
          <li v-for="g in theme.games" :key="g.id">
            <RouterLink
              :to="`/games/${g.id}`"
              class="flex items-center gap-1.5 rounded-full border border-line bg-card px-3 py-1 text-sm hover:underline"
            >
              <GameCover :game="g" kind="icon" height="1.25rem" small />{{ localName(g) }}
            </RouterLink>
          </li>
        </ul>
      </section>
    </template>
  </section>
</template>
