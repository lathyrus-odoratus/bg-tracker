<script setup lang="ts">
import { useMechanisms } from '../composables/catalog.ts'
import { localName } from '../i18n/index.ts'

const { data, isPending, isError } = useMechanisms()
</script>

<template>
  <section class="mx-auto grid max-w-3xl gap-4">
    <div class="grid gap-1">
      <h1 class="text-2xl font-black">{{ $t('mechanisms.title') }}</h1>
      <p class="text-sm text-muted">{{ $t('mechanisms.source') }}</p>
    </div>
    <p v-if="isPending" class="text-muted">{{ $t('common.loading') }}</p>
    <p v-else-if="isError" class="text-danger">{{ $t('common.loadFailed') }}</p>
    <ul v-else class="grid gap-2">
      <li v-for="m in data" :key="m.id">
        <RouterLink
          :to="`/mechanisms/${m.id}`"
          class="grid gap-0.5 rounded-xl bg-card px-4 py-3 shadow-card hover:underline"
        >
          <span class="flex items-baseline justify-between gap-3">
            <span class="font-bold">{{ localName(m) }}</span>
            <span class="text-sm text-muted">{{ $t('common.gameCount', m.gameCount) }}</span>
          </span>
          <span v-if="m.description" class="text-sm text-muted">{{ m.description }}</span>
        </RouterLink>
      </li>
    </ul>
  </section>
</template>
