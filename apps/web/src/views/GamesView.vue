<script setup lang="ts">
import { useSessionStore } from '../stores/session.ts'
import { useGames } from '../composables/catalog.ts'
import { formatPlayers } from '../lib/format.ts'
import GameCover from '../components/GameCover.vue'
import ImageVariantPicker from '../components/ImageVariantPicker.vue'
import { useListImage } from '../composables/image-variant.ts'

const { data, isPending, isError } = useGames()
const session = useSessionStore()
const listImage = useListImage()
</script>

<template>
  <section class="mx-auto grid max-w-3xl gap-4">
    <div class="flex items-baseline justify-between gap-3">
      <h1 class="text-2xl font-black">全部遊戲</h1>
      <RouterLink
        v-if="session.isAdmin"
        to="/admin/games/new"
        class="text-sm font-medium text-accent"
      >
        ＋ 新增遊戲
      </RouterLink>
    </div>
    <ImageVariantPicker />
    <p v-if="isPending" class="text-muted">載入中…</p>
    <p v-else-if="isError" class="text-danger">載入失敗</p>
    <ul v-else class="grid gap-2">
      <li v-for="g in data" :key="g.id">
        <RouterLink
          :to="`/games/${g.id}`"
          class="flex items-center gap-3 rounded-xl bg-card px-3 py-2 shadow-card hover:underline"
        >
          <GameCover :game="g" :kind="listImage" height="56px" />
          <span class="min-w-0 flex-1 font-bold">{{ g.name }}</span>
          <span class="hidden text-sm text-muted sm:inline">
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
