<script setup lang="ts">
import { useSessionStore } from '../stores/session.ts'

const session = useSessionStore()
</script>

<template>
  <section class="mx-auto grid max-w-3xl gap-2">
    <h1 class="text-2xl font-black">桌遊機制圖譜</h1>
    <p class="text-muted">
      圓形關係圖還在施工中。
      <template v-if="session.me">目前身分：{{ session.me.displayName }}</template>
      <template v-else>目前是匿名瀏覽。</template>
    </p>
  </section>
</template>
