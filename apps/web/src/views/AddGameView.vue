<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { BgaLookup } from '@bg-tracker/shared'
import { api, ApiError, unwrap } from '../lib/api.ts'
import { errorMessage } from '../lib/form.ts'
import { bgaGameUrl } from '../lib/bga.ts'
import { formatPlayers } from '../lib/format.ts'
import { useInvalidateCatalog } from '../composables/admin.ts'
import { useSessionStore } from '../stores/session.ts'
import GameCover from '../components/GameCover.vue'
import { localName } from '../i18n/index.ts'

/**
 * 成員新增遊戲：只填 BGA 代號，先查詢預覽，確認後新增。
 * 名稱等資料由 server 向 BGA 查；新增後標記「需要 admin review」
 */
const router = useRouter()
const session = useSessionStore()
const invalidate = useInvalidateCatalog()

const slug = ref('')
const slugValid = computed(() => /^[a-z0-9]+$/.test(slug.value.trim()))
const preview = ref<BgaLookup | null>(null)
const looking = ref(false)
const adding = ref(false)
const error = ref('')
/** 已經有這款時的遊戲 id（409 的 details） */
const existingId = ref<string | null>(null)
/** 預覽的名稱：中文介面用中文名、英文介面用英文名，另一個放在下面 */
const previewNames = computed(() => {
  const p = preview.value
  if (!p) return null
  const main = localName({ name: p.nameZh ?? p.nameEn, nameEn: p.nameEn })
  const other = [p.nameZh, p.nameEn].find((n) => n && n !== main) ?? null
  return { main, other }
})

function reset() {
  preview.value = null
  error.value = ''
  existingId.value = null
}

async function lookup() {
  reset()
  looking.value = true
  try {
    preview.value = await unwrap(api.bga[':slug'].$get({ param: { slug: slug.value.trim() } }))
  } catch (err) {
    error.value = errorMessage(err)
  } finally {
    looking.value = false
  }
}

async function add() {
  if (!preview.value) return
  error.value = ''
  existingId.value = null
  adding.value = true
  try {
    const { id } = await unwrap(api.games.$post({ json: { bgaSlug: preview.value.slug } }))
    await invalidate()
    await router.push(`/games/${id}`)
  } catch (err) {
    error.value = errorMessage(err)
    if (err instanceof ApiError && err.code === 'bga_slug_taken') {
      existingId.value = (err.details as { id?: string } | undefined)?.id ?? null
    }
  } finally {
    adding.value = false
  }
}
</script>

<template>
  <section class="mx-auto grid max-w-xl gap-6">
    <header class="grid gap-1">
      <h1 class="text-2xl font-black">{{ $t('addGame.title') }}</h1>
      <p class="text-sm text-muted">{{ $t('addGame.intro') }}</p>
    </header>

    <form class="grid gap-2" @submit.prevent="lookup">
      <label for="add-slug" class="text-sm font-bold">{{ $t('addGame.slug') }}</label>
      <div class="flex gap-2">
        <input
          id="add-slug"
          v-model="slug"
          :placeholder="$t('addGame.placeholder')"
          pattern="[a-z0-9]+"
          required
          class="min-w-0 flex-1 rounded-xl border border-line bg-card px-3 py-2"
          @input="reset"
        />
        <button
          type="submit"
          :disabled="!slugValid || looking"
          class="flex-none rounded-xl border border-line px-4 font-medium hover:border-ink disabled:opacity-50"
        >
          {{ looking ? $t('addGame.looking') : $t('addGame.lookup') }}
        </button>
      </div>
      <i18n-t keypath="addGame.slugHelp" tag="p" class="text-xs text-muted">
        <template #param><code>gamepanel?game=</code></template>
        <template #example>
          <code>boardgamearena.com/gamepanel?game=<b>hanabi</b></code>
        </template>
      </i18n-t>
    </form>

    <article
      v-if="preview && previewNames"
      class="flex items-center gap-4 rounded-2xl bg-card p-4 shadow-card"
    >
      <GameCover
        :game="{ name: preview.nameZh ?? preview.nameEn, bgaSlug: preview.slug, imageUrl: null }"
        kind="box280"
        width="5rem"
      />
      <div class="grid min-w-0 flex-1 gap-0.5">
        <h2 class="text-lg font-black">{{ previewNames.main }}</h2>
        <p v-if="previewNames.other" class="text-sm text-muted">{{ previewNames.other }}</p>
        <p class="text-sm text-muted">
          {{
            formatPlayers(preview.minPlayers, preview.maxPlayers) ?? $t('addGame.unknownPlayers')
          }}
          ·
          <a :href="bgaGameUrl(preview.slug)" target="_blank" rel="noopener" class="text-accent">{{
            $t('addGame.viewOnBga')
          }}</a>
        </p>
      </div>
      <button
        type="button"
        :disabled="adding"
        class="flex-none rounded-xl bg-accent px-4 py-2 font-bold text-accent-ink disabled:opacity-50"
        @click="add"
      >
        {{ adding ? $t('addGame.adding') : $t('addGame.add') }}
      </button>
    </article>

    <p v-if="error" class="rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger" role="alert">
      {{ error }}
      <RouterLink v-if="existingId" :to="`/games/${existingId}`" class="font-bold underline">
        {{ $t('addGame.seeExisting') }}
      </RouterLink>
    </p>

    <i18n-t v-if="session.isAdmin" keypath="addGame.adminHint" tag="p" class="text-sm text-muted">
      <template #link>
        <RouterLink to="/admin/games/new" class="text-accent">{{
          $t('addGame.adminLink')
        }}</RouterLink>
      </template>
    </i18n-t>
  </section>
</template>
