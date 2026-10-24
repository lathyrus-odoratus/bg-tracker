import { computed } from 'vue'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { api, unwrap } from '../lib/api.ts'
import { useSessionStore } from '../stores/session.ts'

const POSTS_KEY = ['posts']

/**
 * 留言，新的在前，一次一頁（25 則），`fetchNextPage` 載入更早的。
 * 留言板只給登入的人：未登入不查
 */
export function usePosts() {
  const session = useSessionStore()
  const query = useInfiniteQuery({
    queryKey: POSTS_KEY,
    queryFn: ({ pageParam }) =>
      unwrap(api.posts.$get({ query: pageParam === null ? {} : { before: String(pageParam) } })),
    initialPageParam: null as number | null,
    getNextPageParam: (last) => last.nextBefore,
    enabled: computed(() => !!session.me),
  })
  const posts = computed(() => query.data.value?.pages.flatMap((p) => p.posts) ?? [])
  return { ...query, posts }
}

export function useCreatePost() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (input: { content: string; replyTo: number | null }) =>
      unwrap(api.posts.$post({ json: input })),
    onSuccess: () => client.invalidateQueries({ queryKey: POSTS_KEY }),
  })
}

export function useEditPost() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ number, content }: { number: number; content: string }) =>
      unwrap(api.posts[':number'].$put({ param: { number: String(number) }, json: { content } })),
    onSuccess: (_post, { number }) =>
      Promise.all([
        client.invalidateQueries({ queryKey: POSTS_KEY }),
        client.invalidateQueries({ queryKey: ['posts', number, 'revisions'] }),
      ]),
  })
}

/** 編輯紀錄：展開時才查 */
export function usePostRevisions(number: () => number, enabled: () => boolean) {
  return useQuery({
    queryKey: computed(() => ['posts', number(), 'revisions']),
    queryFn: () =>
      unwrap(api.posts[':number'].revisions.$get({ param: { number: String(number()) } })),
    enabled: computed(enabled),
  })
}
