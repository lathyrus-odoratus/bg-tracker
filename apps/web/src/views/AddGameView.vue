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
      <h1 class="text-2xl font-black">新增遊戲</h1>
      <p class="text-sm text-muted">
        填 BGA 的遊戲代號就能新增，名稱、人數會從 BGA 帶入。新增後會標記「需要 admin review」，等
        admin 確認名稱與機制。
      </p>
    </header>

    <form class="grid gap-2" @submit.prevent="lookup">
      <label for="add-slug" class="text-sm font-bold">BGA 代號</label>
      <div class="flex gap-2">
        <input
          id="add-slug"
          v-model="slug"
          placeholder="例如 hanabi"
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
          {{ looking ? '查詢中…' : '查詢' }}
        </button>
      </div>
      <p class="text-xs text-muted">
        BGA 遊戲頁網址 <code>gamepanel?game=</code> 後面那段，例如
        <code>boardgamearena.com/gamepanel?game=<b>hanabi</b></code>
      </p>
    </form>

    <article v-if="preview" class="flex items-center gap-4 rounded-2xl bg-card p-4 shadow-card">
      <GameCover
        :game="{ name: preview.nameZh ?? preview.nameEn, bgaSlug: preview.slug, imageUrl: null }"
        kind="box280"
        width="5rem"
      />
      <div class="grid min-w-0 flex-1 gap-0.5">
        <h2 class="text-lg font-black">{{ preview.nameZh ?? preview.nameEn }}</h2>
        <p v-if="preview.nameZh" class="text-sm text-muted">{{ preview.nameEn }}</p>
        <p class="text-sm text-muted">
          {{ formatPlayers(preview.minPlayers, preview.maxPlayers) ?? '人數不明' }}
          ·
          <a :href="bgaGameUrl(preview.slug)" target="_blank" rel="noopener" class="text-accent"
            >在 BGA 上看 ↗</a
          >
        </p>
      </div>
      <button
        type="button"
        :disabled="adding"
        class="flex-none rounded-xl bg-accent px-4 py-2 font-bold text-accent-ink disabled:opacity-50"
        @click="add"
      >
        {{ adding ? '新增中…' : '新增' }}
      </button>
    </article>

    <p v-if="error" class="rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger" role="alert">
      {{ error }}
      <RouterLink v-if="existingId" :to="`/games/${existingId}`" class="font-bold underline">
        去看這款 →
      </RouterLink>
    </p>

    <p v-if="session.isAdmin" class="text-sm text-muted">
      admin：也可以
      <RouterLink to="/admin/games/new" class="text-accent">用完整表單新增</RouterLink>
      （不需要 review）。
    </p>
  </section>
</template>
