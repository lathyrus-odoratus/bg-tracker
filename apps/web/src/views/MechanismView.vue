<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useMechanism } from '../composables/catalog.ts'

const route = useRoute()
const { data: mechanism, isPending, error } = useMechanism(computed(() => String(route.params.id)))
</script>

<template>
  <section class="mx-auto grid max-w-3xl gap-6">
    <p v-if="isPending" class="text-muted">載入中…</p>
    <p v-else-if="error" class="text-danger">找不到這個機制。</p>
    <template v-else-if="mechanism">
      <header class="grid gap-1">
        <h1 class="text-2xl font-black">{{ mechanism.name }}</h1>
        <p v-if="mechanism.description" class="text-muted">{{ mechanism.description }}</p>
      </header>
      <section class="grid gap-2">
        <h2 class="font-bold">使用此機制的遊戲</h2>
        <p v-if="!mechanism.games.length" class="text-sm text-muted">還沒有遊戲使用。</p>
        <ul v-else class="flex flex-wrap gap-2">
          <li v-for="g in mechanism.games" :key="g.id">
            <RouterLink
              :to="`/games/${g.id}`"
              class="flex items-center gap-1.5 rounded-full border border-line bg-card px-3 py-1 text-sm hover:underline"
            >
              <span class="size-2 rounded-full bg-game" />{{ g.name }}
            </RouterLink>
          </li>
        </ul>
      </section>
    </template>
  </section>
</template>
