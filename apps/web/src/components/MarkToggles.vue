<script setup lang="ts">
import { computed, ref } from 'vue'
import type { MyGameStat } from '@bg-tracker/shared'
import { useToggleMark } from '../composables/catalog.ts'
import { errorMessage } from '../lib/form.ts'

/** 想玩、玩過的切換；有遊玩紀錄時「玩過」固定是開的（紀錄才是依據） */
const props = defineProps<{ gameId: string; stat: MyGameStat | undefined }>()

const toggle = useToggleMark()
const error = ref('')
const wished = computed(() => props.stat?.wished ?? false)
const played = computed(() => props.stat?.played ?? false)
const playCount = computed(() => props.stat?.playCount ?? 0)
const hasRecords = computed(() => playCount.value > 0)

async function set(kind: 'wishes' | 'played', on: boolean) {
  error.value = ''
  try {
    await toggle.mutateAsync({ kind, gameId: props.gameId, on })
  } catch (err) {
    error.value = errorMessage(err)
  }
}
</script>

<template>
  <div class="grid gap-1">
    <div class="flex flex-wrap gap-2 text-sm">
      <button
        type="button"
        class="rounded-full border px-3 py-1 font-medium transition disabled:opacity-60"
        :class="
          wished
            ? 'border-accent bg-accent text-accent-ink'
            : 'border-line text-muted hover:text-ink'
        "
        :aria-pressed="wished"
        :disabled="toggle.isPending.value"
        @click="set('wishes', !wished)"
      >
        {{ wished ? '★ 想玩' : '☆ 想玩' }}
      </button>
      <button
        type="button"
        class="rounded-full border px-3 py-1 font-medium transition disabled:cursor-default"
        :class="played ? 'border-ink bg-ink text-bg' : 'border-line text-muted hover:text-ink'"
        :aria-pressed="played"
        :disabled="toggle.isPending.value || hasRecords"
        :title="hasRecords ? '有遊玩紀錄，不能取消' : undefined"
        @click="set('played', !played)"
      >
        <template v-if="hasRecords">✓ 玩過 {{ playCount }} 次</template>
        <template v-else>{{ played ? '✓ 玩過' : '玩過' }}</template>
      </button>
    </div>
    <p v-if="error" class="text-xs text-danger" role="alert">{{ error }}</p>
  </div>
</template>
