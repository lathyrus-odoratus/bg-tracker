import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema/index.ts'

/** 程序共用一個連線池；只跑 migration 的 script 用 `max: 1` */
export function createDb(url: string, options: { max?: number } = {}) {
  const client = postgres(url, { max: options.max ?? 10, onnotice: () => {} })
  const db = drizzle(client, { schema })
  return { db, close: () => client.end({ timeout: 5 }) }
}

export type Db = ReturnType<typeof createDb>['db']

/** 交易物件；需要在呼叫端的交易內執行的函式用這個型別 */
export type Tx = Parameters<Parameters<Db['transaction']>[0]>[0]
/** 一般連線或交易都可以 */
export type Executor = Db | Tx
