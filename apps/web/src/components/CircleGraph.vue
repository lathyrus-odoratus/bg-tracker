<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'
import type { Graph } from '@bg-tracker/shared'
import {
  circleLayout,
  connectedKeys,
  hitAreaPath,
  labelTransform,
  type LayoutNode,
  type NodeKind,
} from '../lib/circle-layout.ts'

export interface Selection {
  kind: NodeKind
  id: string
}

const props = defineProps<{
  graph: Graph
  /** 點擊選取的節點（詳情顯示在圖旁邊） */
  selected: Selection | null
  /** 圖外面 hover 的節點（例如旁邊的圖示列表），和圖上的 hover 一樣點亮 */
  highlight?: Selection | null
}>()
const emit = defineEmits<{ select: [Selection | null] }>()

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
/** 點擊區從圓點內側一點開始，到標籤可用空間的外緣 */
const hitInner = computed(() => radius.value - 14)
const hitOuter = computed(() => radius.value + LABEL_SPACE - 4)
const layout = computed(() => circleLayout(props.graph, radius.value))

/** hover／鍵盤 focus 暫時點亮（圖上或圖外）；沒有的話點亮選取的節點 */
const hovered = ref<Selection | null>(null)
const active = computed(() => hovered.value ?? props.highlight ?? props.selected)

/**
 * 標籤放不下就截斷，完整名稱放在 <title>（hover 提示）。
 * 用估計寬度判斷（12px 字：中日韓全形字約 12px、其他約 6.6px），英文名稱可以放比較多字
 */
const LABEL_MAX_WIDTH = LABEL_SPACE - LABEL_OFFSET - 4
const charWidth = (ch: string) => (/[\u2E80-\uFFEF]/.test(ch) ? 12 : 6.6)
function shortLabel(name: string) {
  const chars = [...name]
  if (chars.reduce((w, ch) => w + charWidth(ch), 0) <= LABEL_MAX_WIDTH) return name
  let width = charWidth('…')
  let end = 0
  while (end < chars.length && width + charWidth(chars[end]!) <= LABEL_MAX_WIDTH) {
    width += charWidth(chars[end]!)
    end++
  }
  return `${chars.slice(0, end).join('').trimEnd()}…`
}
const lit = computed(() =>
  active.value ? connectedKeys(props.graph, active.value.kind, active.value.id) : null,
)
const key = (n: Selection) => `${n.kind}:${n.id}`

function nodeState(n: LayoutNode) {
  if (props.selected && key(props.selected) === key(n)) return 'selected'
  if (!lit.value) return 'idle'
  if (active.value && key(active.value) === key(n)) return 'active'
  return lit.value.has(key(n)) ? 'lit' : 'dim'
}

function linkLit(gameId: string, mechanismId: string) {
  const a = active.value
  if (!a) return false
  return a.kind === 'game' ? a.id === gameId : a.id === mechanismId
}

// 觸控的 pointerenter／pointerleave 在每次點擊時都會觸發，不當成 hover
function onEnter(e: PointerEvent, n: LayoutNode) {
  if (e.pointerType !== 'touch') hovered.value = { kind: n.kind, id: n.id }
}
function onLeave(e: PointerEvent) {
  if (e.pointerType !== 'touch') hovered.value = null
}
// 只有鍵盤 focus 才當成 hover；點擊造成的 focus 不算
function onFocus(e: FocusEvent, n: LayoutNode) {
  if ((e.target as Element).matches(':focus-visible')) hovered.value = { kind: n.kind, id: n.id }
}

function select(n: LayoutNode) {
  emit('select', { kind: n.kind, id: n.id })
}
</script>

<template>
  <div ref="container" class="w-full" @pointerleave="onLeave">
    <svg
      v-if="size > 0"
      :width="size"
      :height="size"
      :viewBox="`${-size / 2} ${-size / 2} ${size} ${size}`"
      class="mx-auto block"
      role="group"
      aria-label="桌遊與機制的關係圖：右半圈是遊戲，左半圈是機制"
      @click.self="emit('select', null)"
    >
      <g fill="none" stroke-linecap="round" pointer-events="none">
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
          role="button"
          :aria-pressed="nodeState(node) === 'selected'"
          :aria-label="`${node.kind === 'game' ? '遊戲' : '機制'}：${node.name}`"
          @pointerenter="onEnter($event, node)"
          @focus="onFocus($event, node)"
          @blur="hovered = null"
          @click="select(node)"
          @keydown.enter.prevent="select(node)"
          @keydown.space.prevent="select(node)"
        >
          <!-- 點擊區：節點分到的那一格扇形；hover／鍵盤 focus 時描出虛線 -->
          <path :d="hitAreaPath(node, hitInner, hitOuter)" class="hit" />
          <circle :cx="node.x" :cy="node.y" r="4.5" class="dot" />
          <text
            :transform="labelTransform(node, radius, LABEL_OFFSET).transform"
            :text-anchor="labelTransform(node, radius, LABEL_OFFSET).anchor"
            dy="0.35em"
            class="label"
          >
            {{ shortLabel(node.name) }}
          </text>
          <title>{{ node.name }}</title>
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
.hit {
  fill: transparent;
  stroke: transparent;
  stroke-width: 1;
  stroke-dasharray: 4 3;
}
.node:hover .hit,
.node:focus-visible .hit {
  fill: color-mix(in srgb, var(--ink) 4%, transparent);
  stroke: var(--muted);
}
.dot {
  stroke: var(--card);
  stroke-width: 2;
}
.node[data-kind='game'] .dot {
  fill: var(--game);
}
.node[data-kind='mechanism'] .dot {
  fill: var(--mechanism);
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
.node[data-state='lit'] .label,
.node[data-state='selected'] .label {
  font-weight: 700;
}
/* 選取的節點：圓點放大並加外圈 */
.node[data-state='selected'] .dot {
  r: 7;
  stroke: var(--ink);
  stroke-width: 2;
}
.node:focus-visible .label {
  text-decoration: underline;
}
</style>
