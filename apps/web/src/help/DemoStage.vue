<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, provide, ref, useTemplateRef, watch } from 'vue'
import { DEMO, prefersReducedMotion } from './demo.ts'

/**
 * 說明頁的操作示意。畫面只依「第幾步、這一步動手了沒」決定（slot 的 `step`、`done(i)`），
 * 所以可以自動播放，也可以點步驟直接跳過去。
 * 每一步先讓游標移到目標，`ACT_MS` 後才「動手」（點擊、開始打字）。
 * 指標停在畫面上、捲出畫面、切到別的分頁時暫停；偏好減少動態時不自動播放
 */
const props = defineProps<{
  /** 每一步的說明（同時是畫面的文字版） */
  steps: string[]
  /** 每一步的長度（ms），沒給就用 STEP_MS */
  durations?: number[]
}>()

const STEP_MS = 2600
const ACT_MS = 900

const reduced = prefersReducedMotion()
const step = ref(0)
const acted = ref(reduced)
const playing = ref(!reduced)
const hovering = ref(false)
const onScreen = ref(false)
const pageVisible = ref(!document.hidden)
const running = computed(
  () => playing.value && !hovering.value && onScreen.value && pageVisible.value,
)

const stage = useTemplateRef<HTMLElement>('stage')
const bar = useTemplateRef<HTMLElement>('bar')
provide(DEMO, { el: stage, step, acted })

/** 第 i 步的動作做了沒（畫面狀態都從這裡推） */
function done(i: number) {
  return step.value > i || (step.value === i && acted.value)
}

const duration = (i: number) => props.durations?.[i] ?? STEP_MS
// 經過時間每一格都在變：不放進響應式資料，直接改進度條的 style，避免整個示意每一格重畫
let elapsed = reduced ? ACT_MS : 0
let last = 0
let frame = 0

function paint() {
  const p = (step.value + Math.min(1, elapsed / duration(step.value))) / props.steps.length
  if (bar.value) bar.value.style.transform = `scaleX(${p})`
}

function tick(now: number) {
  elapsed += now - last
  last = now
  if (!acted.value && elapsed >= ACT_MS) acted.value = true
  if (elapsed >= duration(step.value)) {
    step.value = (step.value + 1) % props.steps.length
    acted.value = false
    elapsed = 0
  }
  paint()
  frame = requestAnimationFrame(tick)
}

watch(running, (on) => {
  cancelAnimationFrame(frame)
  if (on) {
    last = performance.now()
    frame = requestAnimationFrame(tick)
  }
})

/** 點步驟：跳到那一步「做完」的樣子並暫停，想繼續再按播放 */
function goTo(i: number) {
  playing.value = false
  step.value = i
  acted.value = true
  elapsed = ACT_MS
  paint()
}

// 觸控的 pointerenter／pointerleave 在每次點擊時都會觸發，不當成 hover
function onEnter(e: PointerEvent) {
  if (e.pointerType !== 'touch') hovering.value = true
}
function onLeave(e: PointerEvent) {
  if (e.pointerType !== 'touch') hovering.value = false
}

let observer: IntersectionObserver | undefined
const onVisibility = () => (pageVisible.value = !document.hidden)
onMounted(() => {
  paint()
  observer = new IntersectionObserver(([entry]) => (onScreen.value = !!entry?.isIntersecting), {
    threshold: 0.3,
  })
  if (stage.value) observer.observe(stage.value)
  document.addEventListener('visibilitychange', onVisibility)
})
onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  observer?.disconnect()
  document.removeEventListener('visibilitychange', onVisibility)
})
</script>

<template>
  <figure class="grid gap-3 rounded-2xl bg-card p-3 shadow-card sm:p-4">
    <!-- 示意畫面只是動畫，不能操作也不讀出來；內容由下面的步驟清單說明 -->
    <div
      ref="stage"
      class="relative overflow-hidden rounded-xl border border-line bg-bg p-4 sm:p-6"
      inert
      aria-hidden="true"
      @pointerenter="onEnter"
      @pointerleave="onLeave"
    >
      <slot :step="step" :acted="acted" :done="done" />
      <span
        v-if="playing && hovering"
        class="absolute top-2 right-2 rounded-full bg-card px-2 py-0.5 text-xs text-muted shadow-card"
      >
        {{ $t('help.demo.paused') }}
      </span>
      <div class="absolute inset-x-0 bottom-0 h-0.5 bg-line">
        <div ref="bar" class="h-full origin-left bg-accent" />
      </div>
    </div>

    <figcaption class="flex items-start gap-3">
      <button
        type="button"
        class="flex size-8 flex-none items-center justify-center rounded-full border border-line text-sm text-muted hover:text-ink"
        :aria-label="playing ? $t('help.demo.pause') : $t('help.demo.play')"
        :title="playing ? $t('help.demo.pause') : $t('help.demo.play')"
        @click="playing = !playing"
      >
        <span aria-hidden="true">{{ playing ? '❚❚' : '▶' }}</span>
      </button>
      <ol class="grid flex-1 gap-0.5" :aria-label="$t('help.demo.steps')">
        <li v-for="(text, i) in steps" :key="i">
          <button
            type="button"
            class="flex w-full gap-2 rounded-lg px-2 py-1 text-left text-sm transition-colors"
            :class="i === step ? 'bg-bg font-medium text-ink' : 'text-muted hover:text-ink'"
            :aria-current="i === step ? 'step' : undefined"
            @click="goTo(i)"
          >
            <span
              class="flex size-5 flex-none items-center justify-center rounded-full text-xs tabular-nums transition-colors"
              :class="i === step ? 'bg-accent text-accent-ink' : 'bg-bg'"
              >{{ i + 1 }}</span
            >
            <span>{{ text }}</span>
          </button>
        </li>
      </ol>
    </figcaption>
  </figure>
</template>
