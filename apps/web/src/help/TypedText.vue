<script setup lang="ts">
import { useTypewriter } from './demo.ts'

/** 示意輸入框裡的字：打字中顯示游標線，沒字時顯示 placeholder */
const props = defineProps<{
  text: string
  mode: 'empty' | 'typing' | 'full'
  placeholder?: string
}>()
const typed = useTypewriter(
  () => props.text,
  () => props.mode,
)
</script>

<template>
  <span v-if="typed || mode === 'typing'"
    >{{ typed
    }}<span
      v-if="mode === 'typing'"
      class="caret ml-px inline-block h-[1.1em] w-px translate-y-[0.2em] bg-ink"
  /></span>
  <span v-else class="text-muted">{{ placeholder }}</span>
</template>

<style scoped>
.caret {
  animation: blink 1s steps(1) infinite;
}
@keyframes blink {
  50% {
    opacity: 0;
  }
}
</style>
