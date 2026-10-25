<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { WEIGHT_MAX, WEIGHT_MIN, WEIGHT_STEP, type WeightSummary } from '@bg-tracker/shared'
import { useSetWeight } from '../composables/catalog.ts'
import { errorMessage } from '../lib/form.ts'

/**
 * 重度評分（1.0–9.9、間距 0.1）。拖動時即時顯示數字，放開才儲存；
 * 鍵盤每按一下都會觸發 change，所以停下 400ms 才送出
 */
const props = defineProps<{ gameId: string; weight: WeightSummary }>()

const DEFAULT_WEIGHT = 5
const SAVE_DELAY_MS = 400

const setWeight = useSetWeight()
const error = ref('')
/** slider 目前的位置；還沒評過時停在大家的平均（沒有就 5.0） */
const value = ref(props.weight.mine ?? props.weight.average ?? DEFAULT_WEIGHT)
const touched = ref(false)
watch(
  () => props.weight.mine,
  (mine) => {
    if (mine !== null) value.value = mine
  },
)
const rated = computed(() => props.weight.mine !== null || touched.value)

/** 數值在 slider 軌道上的位置（%） */
function tickPercent(weight: number) {
  return ((weight - WEIGHT_MIN) / (WEIGHT_MAX - WEIGHT_MIN)) * 100
}

let timer: ReturnType<typeof setTimeout> | undefined
onBeforeUnmount(() => clearTimeout(timer))

function onInput(event: Event) {
  value.value = Number((event.target as HTMLInputElement).value)
  touched.value = true
}

function onChange() {
  clearTimeout(timer)
  timer = setTimeout(() => void save(value.value), SAVE_DELAY_MS)
}

async function save(weight: number | null) {
  error.value = ''
  try {
    await setWeight.mutateAsync({ gameId: props.gameId, weight })
    if (weight === null) {
      touched.value = false
      value.value = props.weight.average ?? DEFAULT_WEIGHT
    }
  } catch (err) {
    error.value = errorMessage(err)
  }
}
</script>

<template>
  <section class="grid gap-2" aria-labelledby="weight-label">
    <div class="flex flex-wrap items-baseline justify-between gap-x-3">
      <h2 id="weight-label" class="font-bold">{{ $t('weight.title') }}</h2>
      <p class="text-sm text-muted">
        <template v-if="weight.average !== null">
          {{ $t('weight.everyone')
          }}<span class="font-bold text-ink tabular-nums">{{ weight.average.toFixed(1) }}</span>
          {{ $t('weight.ratings', weight.count) }}
        </template>
        <template v-else>{{ $t('weight.noRatings') }}</template>
      </p>
    </div>
    <div class="flex items-center gap-4">
      <span
        class="w-12 text-center text-2xl font-black tabular-nums"
        :class="rated ? 'text-ink' : 'text-muted'"
        aria-hidden="true"
      >
        {{ rated ? value.toFixed(1) : '—' }}
      </span>
      <div class="grid flex-1 gap-0.5">
        <input
          type="range"
          :min="WEIGHT_MIN"
          :max="WEIGHT_MAX"
          :step="WEIGHT_STEP"
          :value="value"
          class="w-full"
          :class="rated ? 'accent-accent' : 'accent-muted opacity-60'"
          aria-labelledby="weight-label"
          :aria-valuetext="
            rated ? $t('weight.mine', { value: value.toFixed(1) }) : $t('weight.unrated')
          "
          @input="onInput"
          @change="onChange"
        />
        <!-- 刻度依數值放在對應位置（5.0 在 1.0–9.9 的約 45% 處，不是正中間） -->
        <div class="relative h-4 text-xs text-muted" aria-hidden="true">
          <span class="absolute left-0">{{ $t('weight.light') }}</span>
          <span class="absolute -translate-x-1/2" :style="{ left: `${tickPercent(5)}%` }">5.0</span>
          <span class="absolute right-0">{{ $t('weight.heavy') }}</span>
        </div>
      </div>
    </div>
    <p class="flex flex-wrap items-center gap-x-3 text-sm text-muted">
      <template v-if="weight.mine !== null">
        {{ $t('weight.mine', { value: weight.mine.toFixed(1) }) }}
        <button type="button" class="text-accent hover:underline" @click="save(null)">
          {{ $t('weight.clear') }}
        </button>
      </template>
      <template v-else>{{ $t('weight.hint') }}</template>
      <span v-if="setWeight.isPending.value">{{ $t('common.saving') }}</span>
    </p>
    <p v-if="error" class="text-sm text-danger" role="alert">{{ error }}</p>
  </section>
</template>
