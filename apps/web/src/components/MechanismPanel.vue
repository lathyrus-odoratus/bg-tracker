<script setup lang="ts">
import GameCover from './GameCover.vue'
import { useMechanism } from '../composables/catalog.ts'
import type { Selection } from './CircleGraph.vue'
import { localName } from '../i18n/index.ts'

const props = defineProps<{ id: string }>()
const emit = defineEmits<{ select: [Selection]; close: [] }>()

const { data: mechanism, isPending, error } = useMechanism(() => props.id)
</script>

<template>
  <article class="grid content-start gap-4">
    <header class="flex items-start justify-between gap-3">
      <div class="grid gap-0.5">
        <span class="flex items-center gap-1.5 text-xs font-medium text-muted">
          <span class="size-2 rounded-full bg-mechanism" />{{ $t('nav.mechanisms') }}
        </span>
        <h2 class="text-xl font-black">{{ mechanism ? localName(mechanism) : '…' }}</h2>
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
    <template v-else-if="mechanism">
      <p v-if="mechanism.description" class="text-sm">{{ mechanism.description }}</p>
      <section class="grid gap-1.5">
        <h3 class="text-sm font-bold">
          {{ $t('mechanismPanel.games', { n: mechanism.games.length }) }}
        </h3>
        <p v-if="!mechanism.games.length" class="text-sm text-muted">
          {{ $t('mechanisms.noGames') }}
        </p>
        <ul v-else class="flex flex-wrap gap-1.5">
          <li v-for="g in mechanism.games" :key="g.id">
            <button
              type="button"
              class="flex items-center gap-1.5 rounded-full border border-line px-2.5 py-0.5 text-sm hover:border-game"
              @click="emit('select', { kind: 'game', id: g.id })"
            >
              <GameCover :game="g" kind="icon" height="1.25rem" small />{{ localName(g) }}
            </button>
          </li>
        </ul>
      </section>
      <nav class="border-t border-line pt-3 text-sm font-medium">
        <RouterLink :to="`/mechanisms/${mechanism.id}`" class="text-accent hover:underline">
          {{ $t('mechanismPanel.toPage') }}
        </RouterLink>
      </nav>
    </template>
  </article>
</template>
