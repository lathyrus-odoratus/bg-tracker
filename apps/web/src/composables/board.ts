import { computed } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { api, unwrap } from '../lib/api.ts'
import { useSessionStore } from '../stores/session.ts'

const POSTS_KEY = ['posts']

/** 留言板只給登入的人：未登入不查 */
export function usePosts() {
  const session = useSessionStore()
  return useQuery({
    queryKey: POSTS_KEY,
    queryFn: () => unwrap(api.posts.$get()),
    enabled: computed(() => !!session.me),
  })
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
