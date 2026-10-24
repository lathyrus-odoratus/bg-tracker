<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { GameInput } from '@bg-tracker/shared'
import { api, ensureOk, unwrap } from '../../lib/api.ts'
import { errorMessage, toIntOrNull } from '../../lib/form.ts'
import { bgaGameUrl } from '../../lib/bga.ts'
import { useGame, useMechanisms } from '../../composables/catalog.ts'
import { useInvalidateCatalog } from '../../composables/admin.ts'
import GameCover from '../../components/GameCover.vue'

const route = useRoute()
const router = useRouter()
const invalidate = useInvalidateCatalog()

/** /admin/games/new 新增；/admin/games/:id/edit 編輯 */
const id = computed(() => (typeof route.params.id === 'string' ? route.params.id : ''))
const isNew = computed(() => !id.value)
const { data: game } = useGame(id)
const { data: allMechanisms } = useMechanisms()

const form = reactive({
  name: '',
  minPlayers: '' as string | number,
  maxPlayers: '' as string | number,
  playMinutes: '' as string | number,
  bggId: '' as string | number,
  bgaSlug: '',
  imageUrl: '',
  mechanismIds: [] as string[],
})

watch(
  game,
  (g) => {
    if (!g) return
    Object.assign(form, {
      name: g.name,
      minPlayers: g.minPlayers ?? '',
      maxPlayers: g.maxPlayers ?? '',
      playMinutes: g.playMinutes ?? '',
      bggId: g.bggId ?? '',
      bgaSlug: g.bgaSlug ?? '',
      imageUrl: g.imageUrl ?? '',
      mechanismIds: g.mechanisms.map((m) => m.id),
    })
  },
  { immediate: true },
)

const preview = computed(() => ({
  name: form.name || '？',
  bgaSlug: form.bgaSlug.trim() || null,
  imageUrl: form.imageUrl.trim() || null,
}))

/**
 * 「從 BGA 帶入」：按了才查，只填目前空著的欄位（不蓋掉手動改過的名稱等）
 */
const slugValid = computed(() => /^[a-z0-9]+$/.test(form.bgaSlug.trim()))
const fetchingBga = ref(false)
const bgaMessage = ref('')
const bgaError = ref(false)

async function fillFromBga() {
  fetchingBga.value = true
  bgaMessage.value = ''
  bgaError.value = false
  try {
    const bga = await unwrap(api.bga[':slug'].$get({ param: { slug: form.bgaSlug.trim() } }))
    const filled: string[] = []
    const kept: string[] = []
    const fill = (
      label: string,
      key: 'name' | 'minPlayers' | 'maxPlayers' | 'bggId',
      value: string | number | null,
    ) => {
      if (value === null || value === '') return
      if (form[key] === '' || form[key] === null) {
        form[key] = value as never
        filled.push(label)
      } else if (String(form[key]) !== String(value)) {
        kept.push(label)
      }
    }
    fill('名稱', 'name', bga.nameZh ?? bga.nameEn)
    fill('最少人數', 'minPlayers', bga.minPlayers)
    fill('最多人數', 'maxPlayers', bga.maxPlayers)
    fill('BGG id', 'bggId', bga.bggId)
    bgaMessage.value = [
      `BGA：${bga.nameZh ? `${bga.nameZh}（${bga.nameEn}）` : bga.nameEn}`,
      filled.length ? `已帶入${filled.join('、')}` : '沒有空的欄位可以帶入',
      kept.length ? `${kept.join('、')}已經有值，沒有覆蓋` : '',
    ]
      .filter(Boolean)
      .join('。')
  } catch (err) {
    bgaError.value = true
    bgaMessage.value = errorMessage(err)
  } finally {
    fetchingBga.value = false
  }
}

const saving = ref(false)
const error = ref('')

function input(): GameInput {
  return {
    name: form.name,
    minPlayers: toIntOrNull(form.minPlayers),
    maxPlayers: toIntOrNull(form.maxPlayers),
    playMinutes: toIntOrNull(form.playMinutes),
    bggId: toIntOrNull(form.bggId),
    bgaSlug: form.bgaSlug.trim() || null,
    imageUrl: form.imageUrl.trim() || null,
    mechanismIds: form.mechanismIds,
  }
}

async function save() {
  saving.value = true
  error.value = ''
  try {
    const { id: savedId } = isNew.value
      ? await unwrap(api.admin.games.$post({ json: input() }))
      : await unwrap(api.admin.games[':id'].$put({ param: { id: id.value }, json: input() }))
    await invalidate()
    await router.push(`/games/${savedId}`)
  } catch (err) {
    error.value = errorMessage(err)
  } finally {
    saving.value = false
  }
}

async function remove() {
  if (!confirm(`確定刪除「${form.name}」？想玩清單裡的這款遊戲也會一起移除。`)) return
  error.value = ''
  try {
    await ensureOk(api.admin.games[':id'].$delete({ param: { id: id.value } }))
    await invalidate()
    await router.push('/games')
  } catch (err) {
    error.value = errorMessage(err)
  }
}
</script>

<template>
  <section class="mx-auto grid max-w-2xl gap-6">
    <h1 class="text-2xl font-black">{{ isNew ? '新增遊戲' : `編輯：${game?.name ?? '…'}` }}</h1>

    <form class="grid gap-5" @submit.prevent="save">
      <label class="grid gap-1">
        <span class="text-sm font-bold">名稱</span>
        <input v-model="form.name" required maxlength="100" class="field" />
      </label>

      <div class="grid grid-cols-3 gap-3">
        <label class="grid gap-1">
          <span class="text-sm font-bold">最少人數</span>
          <input v-model="form.minPlayers" type="number" min="1" class="field" />
        </label>
        <label class="grid gap-1">
          <span class="text-sm font-bold">最多人數</span>
          <input v-model="form.maxPlayers" type="number" min="1" class="field" />
        </label>
        <label class="grid gap-1">
          <span class="text-sm font-bold">時長（分鐘）</span>
          <input v-model="form.playMinutes" type="number" min="1" class="field" />
        </label>
      </div>

      <div class="grid items-start gap-3 sm:grid-cols-2">
        <div class="grid gap-1">
          <label for="bga-slug" class="text-sm font-bold">BGA 代號</label>
          <div class="flex gap-2">
            <input
              id="bga-slug"
              v-model="form.bgaSlug"
              placeholder="sevenwonders"
              pattern="[a-z0-9]+"
              class="field min-w-0 flex-1"
            />
            <button
              type="button"
              class="flex-none rounded-xl border border-line px-3 text-sm font-medium hover:border-ink disabled:opacity-50"
              :disabled="!slugValid || fetchingBga"
              @click="fillFromBga"
            >
              {{ fetchingBga ? '查詢中…' : '從 BGA 帶入' }}
            </button>
          </div>
          <span class="text-xs text-muted">
            BGA 遊戲頁網址 <code>gamepanel?game=</code> 後面那段
            <a
              v-if="form.bgaSlug"
              :href="bgaGameUrl(form.bgaSlug)"
              target="_blank"
              rel="noopener"
              class="text-accent"
              >（開啟確認 ↗）</a
            >
          </span>
          <p
            v-if="bgaMessage"
            class="text-xs"
            :class="bgaError ? 'text-danger' : 'text-muted'"
            role="status"
          >
            {{ bgaMessage }}
          </p>
        </div>
        <label class="grid gap-1">
          <span class="text-sm font-bold">BGG id</span>
          <input v-model="form.bggId" type="number" min="1" class="field" />
        </label>
      </div>

      <div class="grid gap-2">
        <label class="grid gap-1">
          <span class="text-sm font-bold">自訂圖片網址（選填）</span>
          <input v-model="form.imageUrl" type="url" placeholder="https://…" class="field" />
          <span class="text-xs text-muted">沒填就用 BGA 的圖。</span>
        </label>
        <div class="flex flex-wrap items-end gap-3">
          <GameCover :game="preview" kind="box280" width="8rem" />
          <GameCover :game="preview" kind="icon" width="3rem" />
          <GameCover :game="preview" kind="bannerTitle" width="min(20rem, 100%)" />
        </div>
      </div>

      <fieldset class="grid gap-2">
        <legend class="text-sm font-bold">機制</legend>
        <p class="text-xs text-muted">
          沒有的機制先到
          <RouterLink to="/admin/mechanisms/new" class="text-accent">新增機制</RouterLink>。
        </p>
        <div class="flex flex-wrap gap-1.5">
          <label
            v-for="m in allMechanisms"
            :key="m.id"
            class="flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-sm"
            :class="
              form.mechanismIds.includes(m.id)
                ? 'border-mechanism bg-card font-bold'
                : 'border-line text-muted'
            "
          >
            <input
              v-model="form.mechanismIds"
              type="checkbox"
              :value="m.id"
              class="accent-mechanism"
            />
            {{ m.name }}
          </label>
        </div>
      </fieldset>

      <p v-if="error" class="rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger" role="alert">
        {{ error }}
      </p>

      <div class="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          :disabled="saving"
          class="rounded-xl bg-accent px-5 py-2 font-bold text-accent-ink disabled:opacity-50"
        >
          {{ saving ? '儲存中…' : '儲存' }}
        </button>
        <RouterLink :to="isNew ? '/games' : `/games/${id}`" class="text-muted">取消</RouterLink>
        <button v-if="!isNew" type="button" class="ml-auto text-sm text-danger" @click="remove">
          刪除這款遊戲
        </button>
      </div>
    </form>
  </section>
</template>

<style scoped>
.field {
  border: 1px solid var(--line);
  border-radius: 0.75rem;
  background: var(--card);
  padding: 0.5rem 0.75rem;
}
</style>
