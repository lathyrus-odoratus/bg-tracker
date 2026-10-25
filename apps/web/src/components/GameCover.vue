<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { BGA_IMAGES, bgaImageUrls, type BgaImageKey } from '../lib/bga.ts'

/**
 * 遊戲圖：有自訂圖片就用它，否則用 BGA 代號組出指定的 BGA 圖。
 * 外層決定比例與大小，圖片（或兩層疊起來的橫幅＋標題）填滿外層。
 * 底圖沒有或載入失敗時顯示名稱首字的佔位卡；標題字載入失敗就只留橫幅。
 */
const props = defineProps<{
  game: { name: string; bgaSlug: string | null; imageUrl: string | null }
  kind: BgaImageKey
  /** 外層的 CSS 寬度或高度（另一邊依比例算）；預設寬度 100% */
  width?: string
  height?: string
  /** 很小的圖（標籤裡的圖示）：圓角跟著變小 */
  small?: boolean
  /** 顯示比例（寬 / 高）；預設用原圖比例，比原圖窄時底圖左右被裁掉 */
  ratio?: number
}>()

const urls = computed(() => {
  if (props.game.imageUrl) return { base: props.game.imageUrl }
  return props.game.bgaSlug ? bgaImageUrls(props.game.bgaSlug, props.kind) : null
})
const baseFailed = ref(false)
const overlayFailed = ref(false)
watch(urls, () => {
  baseFailed.value = false
  overlayFailed.value = false
})

const ratio = computed(() => {
  const { width, height } = BGA_IMAGES[props.kind]
  return props.ratio ?? width / height
})
const style = computed(() => {
  const size = props.height ? { height: props.height } : { width: props.width ?? '100%' }
  return { ...size, aspectRatio: String(ratio.value) }
})
/** 標題字寬度：原圖比例（約 3.5:1）時是外層的 85%，外層越高越窄，logo 才不會撐滿 */
const overlayWidth = computed(() => `${Math.min(85, 32.5 * ratio.value)}%`)
</script>

<template>
  <div
    class="relative flex flex-none items-center justify-center overflow-hidden bg-bg [container-type:inline-size]"
    :class="small ? 'rounded' : 'rounded-xl'"
    :style="style"
  >
    <template v-if="urls && !baseFailed">
      <img
        :src="urls.base"
        alt=""
        class="absolute inset-0 size-full"
        :class="urls.overlay ? 'object-cover' : 'object-contain'"
        loading="lazy"
        referrerpolicy="no-referrer"
        @error="baseFailed = true"
      />
      <!-- 標題字是正方形、logo 在中間：置中，上下的透明部分被外層裁掉 -->
      <img
        v-if="urls.overlay && !overlayFailed"
        :src="urls.overlay"
        alt=""
        class="absolute top-1/2 left-1/2 max-w-none -translate-1/2 drop-shadow"
        :style="{ width: overlayWidth }"
        loading="lazy"
        referrerpolicy="no-referrer"
        @error="overlayFailed = true"
      />
      <span class="sr-only">{{ game.name }}</span>
    </template>
    <!-- 佔位字跟著外層大小縮放（cqi = 外層寬度的 1%） -->
    <span
      v-else
      class="leading-none font-black text-muted"
      style="font-size: min(50cqi, 1.5rem)"
      aria-hidden="true"
      >{{ [...game.name][0] }}</span
    >
  </div>
</template>
