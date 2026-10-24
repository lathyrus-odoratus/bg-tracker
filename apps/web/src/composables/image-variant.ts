import { ref, watch } from 'vue'
import { readStorage, writeStorage } from '../lib/storage.ts'

/** 列表可以選的圖（試用階段，定案後拿掉切換） */
export const LIST_IMAGE_OPTIONS = ['icon', 'bannerTitle'] as const
export type ListImage = (typeof LIST_IMAGE_OPTIONS)[number]

const KEY = 'bgt:list-image'
const stored = readStorage(KEY)
const listImage = ref<ListImage>(LIST_IMAGE_OPTIONS.find((o) => o === stored) ?? 'bannerTitle')
watch(listImage, (next) => writeStorage(KEY, next))

/** 遊戲列表用哪一種 BGA 圖；存在瀏覽器 */
export function useListImage() {
  return listImage
}
