<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CircleGraph, { type Selection } from '../components/CircleGraph.vue'
import GamePanel from '../components/GamePanel.vue'
import MechanismPanel from '../components/MechanismPanel.vue'
import TopWishes from '../components/TopWishes.vue'
import GameIconGrid from '../components/GameIconGrid.vue'
import { useGames, useGraph, useMyGameStats } from '../composables/catalog.ts'

const route = useRoute()
const router = useRouter()
const { data: graph, isPending, isError } = useGraph()
const { data: games } = useGames()
const my = useMyGameStats()
/** 左側圖示 hover 中的遊戲：圓形圖跟著點亮 */
const listHover = ref<Selection | null>(null)

/** 選取的節點放在網址（?game=… 或 ?mechanism=…），可以分享，上一頁也回得去 */
const selected = computed<Selection | null>(() => {
  const { game, mechanism } = route.query
  if (typeof game === 'string') return { kind: 'game', id: game }
  if (typeof mechanism === 'string') return { kind: 'mechanism', id: mechanism }
  return null
})

function select(next: Selection | null) {
  void router.push({ query: next ? { [next.kind]: next.id } : {} })
}

// 窄螢幕的面板在圖下方：選取後捲到面板，不然看不到詳情
const panel = useTemplateRef<HTMLElement>('panel')
watch(selected, async (next) => {
  if (!next || window.matchMedia('(min-width: 64rem)').matches) return
  await nextTick()
  panel.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
})
</script>

<template>
  <!-- 寬螢幕三欄：圖示格子｜圓形圖｜詳情；窄一點時不放圖示格子（遊戲列表頁一樣能用） -->
  <div
    class="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] xl:max-w-[92rem] xl:grid-cols-[10rem_minmax(0,1fr)_22rem]"
  >
    <!-- 不設 overflow：hover 時的名稱提示要能超出這一欄 -->
    <aside v-if="games?.length" class="hidden xl:sticky xl:top-6 xl:block xl:self-start xl:p-1">
      <GameIconGrid
        :games="games"
        :selected-id="selected?.kind === 'game' ? selected.id : null"
        @select="select"
        @hover="listHover = $event"
      />
    </aside>
    <section class="grid min-w-0 content-start gap-3">
      <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h1 class="text-2xl font-black">{{ $t('home.title') }}</h1>
        <ul class="flex gap-4 text-sm text-muted" :aria-label="$t('home.legend')">
          <li class="flex items-center gap-1.5">
            <span class="size-2.5 rounded-full bg-game" />{{ $t('home.legendGame') }}
          </li>
          <li class="flex items-center gap-1.5">
            <span class="size-2.5 rounded-full bg-mechanism" />{{ $t('home.legendMechanism') }}
          </li>
        </ul>
      </div>
      <p class="text-sm text-muted">{{ $t('home.hint') }}</p>
      <p v-if="isPending" class="text-muted">{{ $t('common.loading') }}</p>
      <p v-else-if="isError" class="text-danger">{{ $t('common.loadFailedReload') }}</p>
      <p v-else-if="graph && graph.games.length === 0" class="text-muted">{{ $t('home.empty') }}</p>
      <CircleGraph
        v-else-if="graph"
        :graph="graph"
        :selected="selected"
        :highlight="listHover"
        @select="select"
      />
      <p class="text-sm text-muted">
        {{ $t('home.browse') }}
        <RouterLink to="/games" class="text-accent">{{ $t('games.title') }}</RouterLink> ·
        <RouterLink to="/mechanisms" class="text-accent">{{ $t('mechanisms.title') }}</RouterLink> ·
        <RouterLink to="/themes" class="text-accent">{{ $t('themes.title') }}</RouterLink>
      </p>
    </section>

    <!-- 窄螢幕選取時先保留一個畫面高，面板還在載入時也捲得過去 -->
    <aside
      ref="panel"
      class="scroll-mt-4 lg:sticky lg:top-6 lg:self-start"
      :class="{ 'max-lg:min-h-[calc(100dvh-2rem)]': selected }"
    >
      <div v-if="selected" class="rounded-2xl bg-card p-4 shadow-card">
        <GamePanel
          v-if="selected.kind === 'game'"
          :id="selected.id"
          :key="selected.id"
          :my="my"
          @select="select"
          @close="select(null)"
        />
        <MechanismPanel
          v-else
          :id="selected.id"
          :key="selected.id"
          @select="select"
          @close="select(null)"
        />
      </div>
      <TopWishes v-else />
    </aside>
  </div>
</template>
