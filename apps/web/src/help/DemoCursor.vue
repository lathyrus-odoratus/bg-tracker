<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useDemo } from './demo.ts'

/**
 * 示意用的游標：移到舞台裡符合 `target`（CSS selector）的元素上，`at` 是元素內的相對位置（0–1，預設正中間）。
 * `press` 為 true 時顯示按下去的樣子
 */
const props = defineProps<{
  target: string | null
  at?: { x?: number; y?: number }
  press?: boolean
}>()

const { el: stage, step, acted } = useDemo()
const pos = ref<{ x: number; y: number } | null>(null)
/** 目標不見了（點下去換了畫面）：停在原地淡出，不要飄回左上角 */
const visible = ref(false)

function place() {
  const root = stage.value
  const target = props.target ? root?.querySelector(props.target) : null
  visible.value = !!(root && target)
  if (!root || !target) return
  const r = target.getBoundingClientRect()
  const s = root.getBoundingClientRect()
  pos.value = {
    x: r.left - s.left + r.width * (props.at?.x ?? 0.5),
    y: r.top - s.top + r.height * (props.at?.y ?? 0.5),
  }
}

// 換步驟、動手之後畫面可能換了：等 DOM 更新完再對準
watch(
  () => [props.target, props.at?.x, props.at?.y, step.value, acted.value],
  () => void nextTick(place),
  { flush: 'post' },
)

let observer: ResizeObserver | undefined
onMounted(() => {
  place()
  observer = new ResizeObserver(() => place())
  if (stage.value) observer.observe(stage.value)
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div
    class="pointer-events-none absolute top-0 left-0 z-10 transition-[translate,opacity] duration-700 ease-out motion-reduce:transition-none"
    :class="visible ? 'opacity-100' : 'opacity-0'"
    :style="pos ? { translate: `${pos.x}px ${pos.y}px` } : undefined"
  >
    <span
      v-if="press"
      class="ripple absolute -top-4 -left-4 size-8 rounded-full border-2 border-accent"
    />
    <svg
      viewBox="0 0 16 22"
      class="relative block h-[22px] w-4 drop-shadow transition-transform"
      :class="{ 'scale-85': press }"
    >
      <path
        d="M1 1v17.5l4.4-4.2 2.9 6.6 2.9-1.3-2.9-6.4H14z"
        fill="var(--ink)"
        stroke="var(--card)"
        stroke-width="1.5"
        stroke-linejoin="round"
      />
    </svg>
  </div>
</template>

<style scoped>
.ripple {
  animation: ripple 600ms ease-out forwards;
}
@keyframes ripple {
  from {
    transform: scale(0.3);
    opacity: 0.9;
  }
  to {
    transform: scale(1.4);
    opacity: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .ripple {
    animation: none;
    opacity: 0.6;
  }
}
</style>
