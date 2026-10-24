import { useQuery } from '@tanstack/vue-query'
import { api, unwrap } from '../lib/api.ts'

/** 執行時的公開設定（版本、commit）；不會變，取一次就好 */
export function useAppConfig() {
  return useQuery({
    queryKey: ['config'],
    queryFn: () => unwrap(api.config.$get()),
    staleTime: Infinity,
  })
}
