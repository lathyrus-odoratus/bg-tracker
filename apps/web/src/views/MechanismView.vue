<script setup lang="ts">
import GameCover from '../components/GameCover.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useMechanism } from '../composables/catalog.ts'
import { useSessionStore } from '../stores/session.ts'
import { localName } from '../i18n/index.ts'

const route = useRoute()
const session = useSessionStore()
const { data: mechanism, isPending, error } = useMechanism(computed(() => String(route.params.id)))
</script>

<template>
  <section class="mx-auto grid max-w-3xl gap-6">
    <p v-if="isPending" class="text-muted">{{ $t('common.loading') }}</p>
    <p v-else-if="error" class="text-danger">{{ $t('mechanisms.notFound') }}</p>
    <template v-else-if="mechanism">
      <header class="grid gap-1">
        <div class="flex items-baseline justify-between gap-3">
          <h1 class="text-2xl font-black">{{ localName(mechanism) }}</h1>
          <RouterLink
            v-if="session.isAdmin"
            :to="`/admin/mechanisms/${mechanism.id}/edit`"
            class="text-sm font-medium text-accent"
          >
            {{ $t('common.edit') }}
          </RouterLink>
        </div>
        <p v-if="mechanism.description" class="text-muted">{{ mechanism.description }}</p>
      </header>
      <section class="grid gap-2">
        <h2 class="font-bold">{{ $t('mechanisms.games') }}</h2>
        <p v-if="!mechanism.games.length" class="text-sm text-muted">
          {{ $t('mechanisms.noGames') }}
        </p>
        <ul v-else class="flex flex-wrap gap-2">
          <li v-for="g in mechanism.games" :key="g.id">
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
