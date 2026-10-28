<script setup lang="ts">
import { computed } from 'vue'
import { localName } from '../i18n/index.ts'
import DemoCover from './DemoCover.vue'
import DemoCursor from './DemoCursor.vue'
import { sampleGame } from './samples.ts'

/**
 * 機制／主題的示意：列表 → 標籤頁 → 遊戲頁 → 從遊戲頁的標籤到另一個標籤頁。
 * 放在 DemoStage 的 slot 裡，`step`／`acted`／`done` 照傳
 */
interface Tag {
  id: string
  name: string
  nameEn: string | null
  games: string[]
}
const props = defineProps<{
  kind: 'mechanism' | 'theme'
  tags: Tag[]
  /** 依序點的：列表上的標籤、它的遊戲、遊戲頁上的標籤 */
  trail: [string, string, string]
  listTitle: string
  gamesTitle: string
  gameTagsTitle: string
  step: number
  acted: boolean
  done: (i: number) => boolean
}>()

const tag = (id: string) => props.tags.find((t) => t.id === id)!
const dot = computed(() => (props.kind === 'mechanism' ? 'bg-mechanism' : 'bg-game-theme'))
const [first, game, second] = props.trail
/** 遊戲頁上列出的標籤：示意的標籤裡有用到這款的 */
const gameTags = computed(() => props.tags.filter((t) => t.games.includes(game)))

const screen = computed(() => {
  if (!props.done(0)) return { kind: 'list' } as const
  if (!props.done(1)) return { kind: 'tag', tag: tag(first) } as const
  if (!props.done(2)) return { kind: 'game' } as const
  return { kind: 'tag', tag: tag(second) } as const
})
const TARGETS = computed(() => [
  `[data-tag="${first}"]`,
  `[data-game="${game}"]`,
  `[data-tag="${second}"]`,
])
</script>

<template>
  <div class="mx-auto grid h-60 max-w-md content-start">
    <div v-if="screen.kind === 'list'" class="animate-demo-in grid gap-2">
      <span class="text-lg font-black">{{ listTitle }}</span>
      <div class="grid gap-1.5" :class="{ 'grid-cols-2': kind === 'theme' }">
        <span
          v-for="t in tags.slice(0, 4)"
          :key="t.id"
          :data-tag="t.id"
          class="flex items-center justify-between gap-2 rounded-xl bg-card px-3 py-2 text-sm shadow-card"
        >
          <span class="flex items-center gap-1.5 font-bold">
            <span class="size-2 rounded-full" :class="dot" />{{ localName(t) }}
          </span>
          <span class="text-xs text-muted">{{ $t('common.gameCount', t.games.length) }}</span>
        </span>
      </div>
    </div>

    <div v-else-if="screen.kind === 'tag'" :key="screen.tag.id" class="animate-demo-in grid gap-3">
      <span class="flex items-center gap-2 text-xl font-black">
        <span class="size-3 rounded-full" :class="dot" />{{ localName(screen.tag) }}
      </span>
      <span class="text-sm font-bold">{{ gamesTitle }}</span>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="id in screen.tag.games"
          :key="id"
          :data-game="id"
          class="flex items-center gap-1.5 rounded-full border border-line bg-card px-3 py-1 text-sm"
        >
          <DemoCover :id="id" size="sm" />{{ localName(sampleGame(id)) }}
        </span>
      </div>
    </div>

    <div v-else class="animate-demo-in grid gap-3 rounded-2xl bg-card p-4 shadow-card">
      <div class="flex items-center gap-3">
        <DemoCover :id="game" size="lg" />
        <span class="text-lg font-black">{{ localName(sampleGame(game)) }}</span>
      </div>
      <span class="text-sm font-bold">{{ gameTagsTitle }}</span>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="t in gameTags"
          :key="t.id"
          :data-tag="t.id"
          class="flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-sm"
        >
          <span class="size-2 rounded-full" :class="dot" />{{ localName(t) }}
        </span>
      </div>
    </div>
  </div>
  <DemoCursor :target="TARGETS[step] ?? null" :at="{ x: 0.4 }" :press="acted" />
</template>
