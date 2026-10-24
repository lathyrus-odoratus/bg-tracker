import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type { GameDetail, MyGameStat } from '@bg-tracker/shared'
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

/**
 * 切換想玩／玩過。成功後直接把回傳的狀態寫進個人統計，
 * 並讓遊戲詳情（誰想玩、誰玩過）與大家想玩重新取得
 */
export function useToggleMark() {
  const client = useQueryClient()
  const session = useSessionStore()
  return useMutation({
    mutationFn: ({
      kind,
      gameId,
      on,
    }: {
      kind: 'wishes' | 'played'
      gameId: string
      on: boolean
    }) => {
      const route = api.me[kind][':id']
      return unwrap(
        on ? route.$put({ param: { id: gameId } }) : route.$delete({ param: { id: gameId } }),
      )
    },
    onSuccess: (stat) => {
      client.setQueryData<MyGameStat[]>(['me', 'game-stats', session.me?.id], (old = []) => [
        ...old.filter((s) => s.gameId !== stat.gameId),
        stat,
      ])
      return Promise.all([
        client.invalidateQueries({ queryKey: ['games', stat.gameId] }),
        client.invalidateQueries({ queryKey: ['wishes', 'top'] }),
      ])
    },
  })
}

/** 評重度（weight 為 null 時取消）；成功後直接更新遊戲詳情裡的重度 */
export function useSetWeight() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ gameId, weight }: { gameId: string; weight: number | null }) => {
      const route = api.me.weights[':id']
      return unwrap(
        weight === null
          ? route.$delete({ param: { id: gameId } })
          : route.$put({ param: { id: gameId }, json: { weight } }),
      )
    },
    onSuccess: (weight, { gameId }) => {
      client.setQueryData<GameDetail>(['games', gameId], (old) => (old ? { ...old, weight } : old))
    },
  })
}
