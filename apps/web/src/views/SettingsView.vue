<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import { DISPLAY_NAME_MAX } from '@bg-tracker/shared'
import { api, unwrap } from '../lib/api.ts'
import { errorMessage } from '../lib/form.ts'
import { useSessionStore } from '../stores/session.ts'

/** 我的設定：目前只有暱稱（可以重設為 Discord 上的名稱） */
const session = useSessionStore()
const client = useQueryClient()

const name = ref(session.me?.displayName ?? '')
watch(
  () => session.me?.displayName,
  (next) => {
    if (next !== undefined) name.value = next
  },
)
const length = computed(() => [...name.value.trim()].length)
const changed = computed(() => name.value.trim() !== session.me?.displayName)
const canReset = computed(() => !!session.me && session.me.displayName !== session.me.discordName)

const saving = ref(false)
const saved = ref(false)
const error = ref('')

async function save(displayName: string) {
  saving.value = true
  saved.value = false
  error.value = ''
  try {
    session.me = await unwrap(api.me['display-name'].$put({ json: { displayName } }))
    saved.value = true
    // 遊玩紀錄、留言板、誰想玩等都會顯示暱稱：全部重新取得
    await client.invalidateQueries()
  } catch (err) {
    error.value = errorMessage(err)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section v-if="session.me" class="mx-auto grid max-w-xl gap-6">
    <h1 class="text-2xl font-black">{{ $t('settings.title') }}</h1>

    <form class="grid gap-2 rounded-2xl bg-card p-5 shadow-card" @submit.prevent="save(name)">
      <label for="display-name" class="text-sm font-bold">{{ $t('settings.displayName') }}</label>
      <div class="flex gap-2">
        <input
          id="display-name"
          v-model="name"
          required
          class="min-w-0 flex-1 rounded-xl border border-line bg-bg px-3 py-2"
          @input="saved = false"
        />
        <button
          type="submit"
          :disabled="saving || !changed || length === 0 || length > DISPLAY_NAME_MAX"
          class="flex-none rounded-xl bg-accent px-4 font-bold text-accent-ink disabled:opacity-50"
        >
          {{ saving ? $t('common.saving') : $t('common.save') }}
        </button>
      </div>
      <p class="flex justify-between gap-3 text-xs text-muted">
        <span>{{ $t('settings.displayNameHelp', { max: DISPLAY_NAME_MAX }) }}</span>
        <span class="tabular-nums" :class="{ 'text-danger': length > DISPLAY_NAME_MAX }">
          {{ length }} / {{ DISPLAY_NAME_MAX }}
        </span>
      </p>
      <button
        v-if="canReset"
        type="button"
        :disabled="saving"
        class="justify-self-start text-sm text-accent hover:underline disabled:opacity-50"
        @click="save(session.me.discordName)"
      >
        {{ $t('settings.resetToDiscord', { name: session.me.discordName }) }}
      </button>
      <p v-if="saved" class="text-sm text-muted" role="status">{{ $t('settings.saved') }}</p>
      <p v-if="error" class="text-sm text-danger" role="alert">{{ error }}</p>
    </form>
  </section>
</template>
