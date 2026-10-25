<script setup lang="ts">
import { useGameThemes } from '../composables/catalog.ts'
import { localName } from '../i18n/index.ts'

const { data, isPending, isError } = useGameThemes()
</script>

<template>
  <section class="mx-auto grid max-w-3xl gap-4">
    <div class="grid gap-1">
      <h1 class="text-2xl font-black">{{ $t('themes.title') }}</h1>
      <p class="text-sm text-muted">{{ $t('themes.source') }}</p>
    </div>
    <p v-if="isPending" class="text-muted">{{ $t('common.loading') }}</p>
    <p v-else-if="isError" class="text-danger">{{ $t('common.loadFailed') }}</p>
    <ul v-else class="grid gap-2 sm:grid-cols-2">
      <li v-for="theme in data" :key="theme.id">
        <RouterLink
          :to="`/themes/${theme.id}`"
          class="flex items-baseline justify-between gap-3 rounded-xl bg-card px-4 py-3 shadow-card hover:underline"
        >
          <span class="flex items-center gap-2 font-bold">
            <span class="size-2 rounded-full bg-game-theme" />{{ localName(theme) }}
          </span>
          <span class="text-sm text-muted">{{ $t('common.gameCount', theme.gameCount) }}</span>
        </RouterLink>
      </li>
    </ul>
  </section>
</template>
