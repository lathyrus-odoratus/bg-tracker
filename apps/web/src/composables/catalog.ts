import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import type { MyGameStat } from '@bg-tracker/shared'
import { api, unwrap } from '../lib/api.ts'
import { readLocalWishes } from '../lib/wishes.ts'
import { useSessionStore } from '../stores/session.ts'

export function useGraph() {
  return useQuery({ queryKey: ['graph'], queryFn: () => unwrap(api.graph.$get()) })
}

export function useTopWishes(k = 10) {
  return useQuery({
    queryKey: ['wishes', 'top', k],
    queryFn: () => unwrap(api.wishes.top.$get({ query: { k: String(k) } })),
  })
}

export function useGames() {
  return useQuery({ queryKey: ['games'], queryFn: () => unwrap(api.games.$get()) })
}

/** id 是空字串時不查（例如首頁還沒選取） */
export function useGame(id: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: ['games', computed(() => toValue(id))],
    queryFn: () => unwrap(api.games[':id'].$get({ param: { id: toValue(id) } })),
    enabled: computed(() => !!toValue(id)),
  })
}

export function useMechanisms() {
  return useQuery({ queryKey: ['mechanisms'], queryFn: () => unwrap(api.mechanisms.$get()) })
}

export function useMechanism(id: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: ['mechanisms', computed(() => toValue(id))],
    queryFn: () => unwrap(api.mechanisms[':id'].$get({ param: { id: toValue(id) } })),
    enabled: computed(() => !!toValue(id)),
  })
}

/**
 * 目前身分在各遊戲的狀態。登入時從 server 取；匿名時只有瀏覽器裡的想玩清單，
 * 玩過次數是 null（表示「登入後才有」，和「玩過 0 次」不同）。
 */
export function useMyGameStats() {
  const session = useSessionStore()
  const query = useQuery({
    queryKey: ['me', 'game-stats', computed(() => session.me?.id)],
    queryFn: () => unwrap(api.me['game-stats'].$get()),
    enabled: computed(() => !!session.me),
  })
  return computed(() => {
    const stats = new Map<string, Omit<MyGameStat, 'playCount'> & { playCount: number | null }>()
    if (session.me) {
      for (const s of query.data.value ?? []) stats.set(s.gameId, s)
      return { loggedIn: true, stats }
    }
    for (const gameId of readLocalWishes()) {
      stats.set(gameId, { gameId, playCount: null, lastPlayedAt: null, wished: true })
    }
    return { loggedIn: false, stats }
  })
}
