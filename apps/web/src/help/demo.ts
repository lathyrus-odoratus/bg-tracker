import { computed, inject, onBeforeUnmount, ref, watch, type InjectionKey, type Ref } from 'vue'

/** DemoStage 提供給裡面的元件（游標要知道舞台的位置，以及何時重新對準目標） */
export interface DemoContext {
  el: Readonly<Ref<HTMLElement | null>>
  step: Readonly<Ref<number>>
  acted: Readonly<Ref<boolean>>
}
export const DEMO: InjectionKey<DemoContext> = Symbol('demo')

export function useDemo() {
  const ctx = inject(DEMO)
  if (!ctx) throw new Error('useDemo() 要放在 DemoStage 裡面')
  return ctx
}

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * 打字效果：`empty` 時沒有字、`typing` 時一個字一個字出現、`full` 時直接顯示全部
 * （跳到某一步或減少動態時不用等）
 */
export function useTypewriter(
  text: () => string,
  mode: () => 'empty' | 'typing' | 'full',
  msPerChar = 110,
) {
  const count = ref(0)
  let timer: ReturnType<typeof setInterval> | undefined
  const chars = computed(() => [...text()])

  watch(
    mode,
    (next) => {
      clearInterval(timer)
      if (next === 'empty') count.value = 0
      else if (next === 'full' || prefersReducedMotion()) count.value = chars.value.length
      else {
        count.value = 0
        timer = setInterval(() => {
          count.value++
          if (count.value >= chars.value.length) clearInterval(timer)
        }, msPerChar)
      }
    },
    { immediate: true },
  )
  onBeforeUnmount(() => clearInterval(timer))

  return computed(() => chars.value.slice(0, count.value).join(''))
}

/** 數字平滑地變到目標值（示意的評分、平均）；減少動態時直接跳過去 */
export function useTween(target: () => number, ms = 700) {
  const value = ref(target())
  let frame = 0

  watch(target, (to) => {
    cancelAnimationFrame(frame)
    if (prefersReducedMotion()) {
      value.value = to
      return
    }
    const from = value.value
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / ms)
      // ease-out cubic，和游標、滑桿的 transition 差不多
      value.value = from + (to - from) * (1 - (1 - p) ** 3)
      if (p < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
  })
  onBeforeUnmount(() => cancelAnimationFrame(frame))

  return value
}
