<script setup lang="ts">
import { computed } from 'vue'
import { WEIGHT_MAX, WEIGHT_MIN } from '@bg-tracker/shared'
import { useTween } from './demo.ts'

/**
 * 重度滑桿的示意版（樣子和文字同 WeightSlider）。真的 <input type="range"> 沒辦法讓圓點平滑地滑過去，
 * 所以這裡用 div 畫，數字用 tween
 */
const props = defineProps<{
  average: number
  mine: number
  /** 拖到我的評分了（還沒存也算） */
  dragging: boolean
  saving: boolean
  saved: boolean
}>()

const COUNT = 3
const rated = computed(() => props.dragging || props.saved)
const value = useTween(() => (rated.value ? props.mine : props.average))
const newAverage = computed(() =>
  props.saved ? (props.average * COUNT + props.mine) / (COUNT + 1) : props.average,
)
const shownAverage = useTween(() => newAverage.value)
const percent = computed(() => ((value.value - WEIGHT_MIN) / (WEIGHT_MAX - WEIGHT_MIN)) * 100)
const tick5 = ((5 - WEIGHT_MIN) / (WEIGHT_MAX - WEIGHT_MIN)) * 100
</script>

<template>
  <section class="mx-auto grid max-w-md gap-2 rounded-2xl bg-card p-4 shadow-card">
    <div class="flex flex-wrap items-baseline justify-between gap-x-3">
      <h2 class="font-bold">{{ $t('weight.title') }}</h2>
      <p class="text-sm text-muted">
        {{ $t('weight.everyone')
        }}<span class="font-bold text-ink tabular-nums">{{ shownAverage.toFixed(1) }}</span>
        {{ $t('weight.ratings', saved ? COUNT + 1 : COUNT) }}
      </p>
    </div>
    <div class="flex items-center gap-4">
      <span
        class="w-12 text-center text-2xl font-black tabular-nums"
        :class="rated ? 'text-ink' : 'text-muted'"
      >
        {{ rated ? value.toFixed(1) : '—' }}
      </span>
      <div class="grid flex-1 gap-0.5">
        <div data-track class="relative h-5">
          <div class="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-line" />
          <div
            class="absolute top-1/2 left-0 h-1.5 -translate-y-1/2 rounded-full"
            :class="rated ? 'bg-accent' : 'bg-muted opacity-40'"
            :style="{ width: `${percent}%` }"
          />
          <div
            class="absolute top-1/2 size-4 -translate-1/2 rounded-full border-2 bg-card shadow transition-transform"
            :class="[rated ? 'border-accent' : 'border-muted', { 'scale-125': dragging && !saved }]"
            :style="{ left: `${percent}%` }"
          />
        </div>
        <div class="relative h-4 text-xs text-muted">
          <span class="absolute left-0">{{ $t('weight.light') }}</span>
          <span class="absolute -translate-x-1/2" :style="{ left: `${tick5}%` }">5.0</span>
          <span class="absolute right-0">{{ $t('weight.heavy') }}</span>
        </div>
      </div>
    </div>
    <p class="flex h-6 flex-wrap items-center gap-x-3 text-sm text-muted">
      <template v-if="saving">{{ $t('common.saving') }}</template>
      <template v-else-if="saved">
        {{ $t('weight.mine', { value: mine.toFixed(1) }) }}
        <span data-clear class="text-accent">{{ $t('weight.clear') }}</span>
      </template>
      <template v-else>{{ $t('weight.hint') }}</template>
    </p>
  </section>
</template>
