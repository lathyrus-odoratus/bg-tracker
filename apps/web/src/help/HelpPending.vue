<script setup lang="ts">
import { computed } from 'vue'
import { HELP_PAGES, helpPath } from './registry.ts'

/** 還沒寫的篇章：打個招呼，指向同一組裡已經寫好的 */
const props = defineProps<{ module: string }>()
const ready = computed(() => HELP_PAGES.filter((p) => p.module === props.module && p.component))
</script>

<template>
  <div
    class="grid justify-items-center gap-3 rounded-2xl border border-dashed border-line px-6 py-12 text-center"
  >
    <span class="wave text-4xl" aria-hidden="true">👋</span>
    <p class="text-lg font-bold">{{ $t('help.pendingHello') }}</p>
    <p class="max-w-md text-sm text-muted">{{ $t('help.pendingBody') }}</p>
    <ul v-if="ready.length" class="flex flex-wrap justify-center gap-2 text-sm">
      <li v-for="p in ready" :key="p.id">
        <RouterLink :to="helpPath(p)" class="text-accent hover:underline">
          {{ $t(`help.pages.${p.module}.${p.id}.title`) }} →
        </RouterLink>
      </li>
    </ul>
    <RouterLink v-else to="/help/start/welcome" class="text-sm text-accent hover:underline">
      {{ $t('help.pages.start.welcome.title') }} →
    </RouterLink>
  </div>
</template>

<style scoped>
.wave {
  transform-origin: 70% 70%;
  animation: wave 2.4s ease-in-out infinite;
}
@keyframes wave {
  0%,
  60%,
  100% {
    transform: rotate(0);
  }
  10%,
  30% {
    transform: rotate(14deg);
  }
  20%,
  40% {
    transform: rotate(-8deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .wave {
    animation: none;
  }
}
</style>
