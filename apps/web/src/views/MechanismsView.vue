<script setup lang="ts">
import { useMechanisms } from '../composables/catalog.ts'

const { data, isPending, isError } = useMechanisms()
</script>

<template>
  <section class="mx-auto grid max-w-3xl gap-4">
    <h1 class="text-2xl font-black">全部機制</h1>
    <p v-if="isPending" class="text-muted">載入中…</p>
    <p v-else-if="isError" class="text-danger">載入失敗</p>
    <ul v-else class="grid gap-2">
      <li v-for="m in data" :key="m.id">
        <RouterLink
          :to="`/mechanisms/${m.id}`"
          class="grid gap-0.5 rounded-xl bg-card px-4 py-3 shadow-card hover:underline"
        >
          <span class="flex items-baseline justify-between gap-3">
            <span class="font-bold">{{ m.name }}</span>
            <span class="text-sm text-muted">{{ m.gameCount }} 款遊戲</span>
          </span>
          <span v-if="m.description" class="text-sm text-muted">{{ m.description }}</span>
        </RouterLink>
      </li>
    </ul>
  </section>
</template>
