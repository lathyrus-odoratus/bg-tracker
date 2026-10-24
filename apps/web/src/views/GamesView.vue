<script setup lang="ts">
import { useGames } from '../composables/catalog.ts'
import { formatPlayers } from '../lib/format.ts'

const { data, isPending, isError } = useGames()
</script>

<template>
  <section class="mx-auto grid max-w-3xl gap-4">
    <h1 class="text-2xl font-black">全部遊戲</h1>
    <p v-if="isPending" class="text-muted">載入中…</p>
    <p v-else-if="isError" class="text-danger">載入失敗</p>
    <ul v-else class="grid gap-2">
      <li v-for="g in data" :key="g.id">
        <RouterLink
          :to="`/games/${g.id}`"
          class="flex items-baseline justify-between gap-3 rounded-xl bg-card px-4 py-3 shadow-card hover:underline"
        >
          <span class="font-bold">{{ g.name }}</span>
          <span class="text-sm text-muted">
            {{
              [
                formatPlayers(g.minPlayers, g.maxPlayers),
                g.playMinutes && `${g.playMinutes} 分鐘`,
                `${g.mechanismCount} 個機制`,
              ]
                .filter(Boolean)
                .join(' · ')
            }}
          </span>
        </RouterLink>
      </li>
    </ul>
  </section>
</template>
