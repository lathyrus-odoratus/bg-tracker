import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import type { MyGameStat } from '@bg-tracker/shared'
import { api, unwrap } from '../lib/api.ts'
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

/** 目前身分在各遊戲的玩過次數、上次遊玩、想玩；沒玩過也沒想玩的遊戲不在 map 裡 */
export function useMyGameStats() {
  const session = useSessionStore()
  const query = useQuery({
    queryKey: ['me', 'game-stats', computed(() => session.me?.id)],
    queryFn: () => unwrap(api.me['game-stats'].$get()),
    enabled: computed(() => !!session.me),
  })
  return computed(() => ({
    stats: new Map<string, MyGameStat>((query.data.value ?? []).map((s) => [s.gameId, s])),
  }))
}
