<script setup lang="ts">
import { computed, ref } from 'vue'
import { useGames } from '../composables/catalog.ts'
import { useInvalidateCatalog } from '../composables/admin.ts'
import { useSessionStore } from '../stores/session.ts'
import { api, unwrap } from '../lib/api.ts'
import { errorMessage } from '../lib/form.ts'
import { byLocalName, localName, t } from '../i18n/index.ts'
import { formatPlayers } from '../lib/format.ts'
import GameCover from '../components/GameCover.vue'
import ImageVariantPicker from '../components/ImageVariantPicker.vue'
import ReviewBadge from '../components/ReviewBadge.vue'
import { useListImage } from '../composables/image-variant.ts'

const { data, isPending, isError } = useGames()
/** server 依中文名稱排序；英文介面依英文名稱重排 */
const sorted = computed(() => [...(data.value ?? [])].sort(byLocalName))
const listImage = useListImage()
const session = useSessionStore()
const invalidate = useInvalidateCatalog()

/** admin：從 BGA 目錄同步所有有代號的遊戲的機制與主題（以 BGA 為準） */
const syncing = ref(false)
const syncMessage = ref('')
async function syncFromBga() {
  if (!confirm(t('games.syncConfirm'))) return
  syncing.value = true
  syncMessage.value = ''
  try {
    const result = await unwrap(api.admin.bga.sync.$post())
    await invalidate()
    syncMessage.value = [
      t('games.synced', result.updated),
      result.missing.length
        ? t('games.syncMissing', { slugs: result.missing.join(t('common.listSep')) })
        : '',
    ]
      .filter(Boolean)
      .join(t('common.sentenceSep'))
  } catch (err) {
    syncMessage.value = errorMessage(err)
  } finally {
    syncing.value = false
  }
}
</script>

<template>
  <section class="mx-auto grid max-w-3xl gap-4">
    <div class="flex items-baseline justify-between gap-3">
      <h1 class="text-2xl font-black">{{ $t('games.title') }}</h1>
      <div class="flex items-baseline gap-4">
        <button
          v-if="session.isAdmin"
          type="button"
          :disabled="syncing"
          class="text-sm font-medium text-muted hover:text-ink disabled:opacity-50"
          @click="syncFromBga"
        >
          {{ syncing ? $t('games.syncing') : $t('games.sync') }}
        </button>
        <RouterLink to="/games/new" class="text-sm font-medium text-accent">{{
          $t('games.add')
        }}</RouterLink>
      </div>
    </div>
    <p v-if="syncMessage" class="text-sm text-muted" role="status">{{ syncMessage }}</p>
    <ImageVariantPicker />
    <p v-if="isPending" class="text-muted">{{ $t('common.loading') }}</p>
    <p v-else-if="isError" class="text-danger">{{ $t('common.loadFailed') }}</p>
    <ul v-else class="grid gap-2">
      <li v-for="g in sorted" :key="g.id">
        <RouterLink
          :to="`/games/${g.id}`"
          class="flex items-center gap-3 rounded-xl bg-card px-3 py-2 shadow-card hover:underline"
        >
          <GameCover :game="g" :kind="listImage" height="56px" />
          <span class="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 font-bold">
            {{ localName(g) }}
            <ReviewBadge v-if="g.needsReview" />
          </span>
          <span class="hidden text-sm text-muted sm:inline">
            {{
              [
                formatPlayers(g.minPlayers, g.maxPlayers),
                g.playMinutes && $t('format.minutes', { n: g.playMinutes }),
                $t('games.mechanismCount', g.mechanismCount),
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
