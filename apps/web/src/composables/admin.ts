import { useQueryClient } from '@tanstack/vue-query'

/** 編輯後讓所有遊戲、機制相關的查詢重新取得（首頁圖、列表、詳細頁） */
export function useInvalidateCatalog() {
  const client = useQueryClient()
  return () =>
    Promise.all(
      [['graph'], ['games'], ['mechanisms'], ['wishes'], ['me']].map((queryKey) =>
        client.invalidateQueries({ queryKey }),
      ),
    )
}
