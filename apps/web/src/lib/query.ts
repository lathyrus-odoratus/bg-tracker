import { QueryClient } from '@tanstack/vue-query'
import { ApiError } from './api.ts'

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        // 4xx 是確定的結果，不重試；網路錯誤或 5xx 最多重試兩次
        retry: (count, error) => !(error instanceof ApiError && error.status < 500) && count < 2,
        refetchOnWindowFocus: true,
      },
      mutations: { retry: false },
    },
  })
}
