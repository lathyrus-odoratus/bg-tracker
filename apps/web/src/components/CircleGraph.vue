<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'
import { useRouter } from 'vue-router'
import type { Graph } from '@bg-tracker/shared'
import {
  circleLayout,
  connectedKeys,
  labelTransform,
  type LayoutNode,
  type NodeKind,
} from '../lib/circle-layout.ts'
import { formatDate } from '../lib/format.ts'
import type { useMyGameStats } from '../composables/catalog.ts'

const props = defineProps<{
  graph: Graph
  my: ReturnType<typeof useMyGameStats>['value']
}>()

const router = useRouter()

/** 標籤要佔的寬度：中文名稱約 7 字 × 12px，再加上和圓點的距離 */
const LABEL_SPACE = 96
const LABEL_OFFSET = 9
const MAX_SIZE = 760

const container = useTemplateRef<HTMLDivElement>('container')
const size = ref(0)
let observer: ResizeObserver | undefined
onMounted(() => {
  observer = new ResizeObserver(([entry]) => {
    if (entry) size.value = Math.min(MAX_SIZE, Math.floor(entry.contentRect.width))
  })
  if (container.value) observer.observe(container.value)
})
onBeforeUnmount(() => observer?.disconnect())

const radius = computed(() => Math.max(60, size.value / 2 - LABEL_SPACE))
const layout = computed(() => circleLayout(props.graph, radius.value))

/** 點亮的節點：hover、鍵盤 focus、或觸控時第一次點擊 */
const active = ref<{ kind: NodeKind; id: string } | null>(null)
const lit = computed(() =>
  active.value ? connectedKeys(props.graph, active.value.kind, active.value.id) : null,
)
const key = (n: { kind: NodeKind; id: string }) => `${n.kind}:${n.id}`

function nodeState(n: LayoutNode) {
  if (!lit.value) return 'idle'
  if (active.value && key(active.value) === key(n)) return 'active'
  return lit.value.has(key(n)) ? 'lit' : 'dim'
}

function linkLit(gameId: string, mechanismId: string) {
  const a = active.value
  if (!a) return false
  return a.kind === 'game' ? a.id === gameId : a.id === mechanismId
}

/** 觸控沒有 hover：第一次點只點亮，點同一個才進入頁面 */
let lastPointer = 'mouse'
function onPointerDown(e: PointerEvent) {
  lastPointer = e.pointerType
}

// 觸控的 pointerenter／pointerleave 會在每次點擊時觸發，交給 onClick 處理
function onEnter(e: PointerEvent, n: LayoutNode) {
  if (e.pointerType !== 'touch') active.value = { kind: n.kind, id: n.id }
}
function onLeave(e: PointerEvent) {
  if (e.pointerType !== 'touch') active.value = null
}

// 只有鍵盤 focus 才點亮；點擊造成的 focus 交給 onClick，不然觸控第一次點就會換頁
function onFocus(e: FocusEvent, n: LayoutNode) {
  if ((e.target as Element).matches(':focus-visible')) active.value = { kind: n.kind, id: n.id }
}

function open(n: LayoutNode) {
  void router.push(n.kind === 'game' ? `/games/${n.id}` : `/mechanisms/${n.id}`)
}

function onClick(n: LayoutNode) {
  if (lastPointer === 'touch' && (!active.value || key(active.value) !== key(n))) {
    active.value = { kind: n.kind, id: n.id }
    return
  }
  open(n)
}

const activeNode = computed(() =>
  active.value ? layout.value.nodes.find((n) => key(n) === key(active.value!)) : undefined,
)
const linkCount = computed(() => (lit.value ? lit.value.size - 1 : 0))
const activeStat = computed(() =>
  activeNode.value?.kind === 'game' ? props.my.stats.get(activeNode.value.id) : undefined,
)
</script>

<template>
  <div ref="container" class="grid w-full gap-2" @pointerleave="onLeave">
    <!-- 資訊列：固定在圖的上方，不遮住節點與連線；觸控時也看得到 -->
    <div
      class="flex min-h-16 flex-wrap items-center gap-x-4 gap-y-0.5 rounded-xl border border-line bg-card px-4 py-2 text-sm"
      role="status"
    >
      <template v-if="activeNode">
        <span class="flex items-center gap-2 font-bold">
          <span class="size-2.5 flex-none rounded-full" :class="`swatch-${activeNode.kind}`" />
          {{ activeNode.name }}
        </span>
        <template v-if="activeNode.kind === 'game'">
          <template v-if="my.loggedIn">
            <span class="text-muted">我玩過 {{ activeStat?.playCount ?? 0 }} 次</span>
            <span class="text-muted">
              上次遊玩：{{ activeStat?.lastPlayedAt ? formatDate(activeStat.lastPlayedAt) : '—' }}
            </span>
          </template>
          <span v-else class="text-muted">登入後顯示遊玩紀錄</span>
          <span class="text-muted">{{ activeStat?.wished ? '★ 我想玩' : '☆ 還沒標想玩' }}</span>
          <span class="text-muted">{{ linkCount }} 個機制</span>
        </template>
        <span v-else class="text-muted">{{ linkCount }} 款遊戲使用</span>
      </template>
      <span v-else class="text-muted">
        移到遊戲上會點亮它用到的機制，移到機制上會點亮使用它的遊戲；點擊進入詳細頁。觸控時先點一下點亮，再點一下進入。
      </span>
    </div>
    <svg
      v-if="size > 0"
      :width="size"
      :height="size"
      :viewBox="`${-size / 2} ${-size / 2} ${size} ${size}`"
      class="mx-auto block"
      role="img"
      aria-label="桌遊與機制的關係圖：右半圈是遊戲，左半圈是機制"
    >
      <g fill="none" stroke-linecap="round">
        <path
          v-for="link in layout.links"
          :key="`${link.gameId}:${link.mechanismId}`"
          :d="link.path"
          class="link"
          :class="{ 'link-lit': linkLit(link.gameId, link.mechanismId), 'link-dim': lit }"
          :data-kind="active?.kind"
        />
      </g>
      <g>
        <g
          v-for="node in layout.nodes"
          :key="key(node)"
          class="node"
          :data-kind="node.kind"
          :data-state="nodeState(node)"
          tabindex="0"
          role="link"
          :aria-label="`${node.kind === 'game' ? '遊戲' : '機制'}：${node.name}`"
          @pointerenter="onEnter($event, node)"
          @pointerdown="onPointerDown"
          @focus="onFocus($event, node)"
          @blur="active = null"
          @click="onClick(node)"
          @keydown.enter="open(node)"
        >
          <!-- 比圓點大的透明命中區 -->
          <line
            :x1="node.x"
            :y1="node.y"
            :x2="node.x * ((radius + LABEL_SPACE - 8) / radius)"
            :y2="node.y * ((radius + LABEL_SPACE - 8) / radius)"
            stroke="transparent"
            stroke-width="18"
          />
          <circle :cx="node.x" :cy="node.y" r="4.5" class="dot" />
          <text
            :transform="labelTransform(node, radius, LABEL_OFFSET).transform"
            :text-anchor="labelTransform(node, radius, LABEL_OFFSET).anchor"
            dy="0.35em"
            class="label"
          >
            {{ node.name }}
          </text>
        </g>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.link {
  stroke: var(--muted);
  stroke-width: 1.25;
  stroke-opacity: 0.28;
  transition: stroke-opacity 120ms;
}
.link-dim {
  stroke-opacity: 0.08;
}
.link-lit {
  stroke-width: 2;
  stroke-opacity: 0.9;
}
.link-lit[data-kind='game'] {
  stroke: var(--game);
}
.link-lit[data-kind='mechanism'] {
  stroke: var(--mechanism);
}
.node {
  cursor: pointer;
  outline: none;
}
.dot {
  stroke: var(--card);
  stroke-width: 2;
}
.node[data-kind='game'] .dot,
.swatch-game {
  fill: var(--game);
  background: var(--game);
}
.node[data-kind='mechanism'] .dot,
.swatch-mechanism {
  fill: var(--mechanism);
  background: var(--mechanism);
}
.label {
  fill: var(--ink);
  font-size: 12px;
  transition: opacity 120ms;
}
.node[data-state='dim'] {
  opacity: 0.3;
}
.node[data-state='active'] .label,
.node[data-state='lit'] .label {
  font-weight: 700;
}
.node:focus-visible .label {
  text-decoration: underline;
}
</style>
