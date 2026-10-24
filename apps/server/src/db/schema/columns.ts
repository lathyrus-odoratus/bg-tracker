import { randomUUID } from 'node:crypto'
import { sql } from 'drizzle-orm'
import { timestamp, uuid } from 'drizzle-orm/pg-core'

export const id = () =>
  uuid('id')
    .primaryKey()
    .$defaultFn(() => randomUUID())

export const tstz = (name: string) => timestamp(name, { withTimezone: true, mode: 'date' })

export const createdAt = () => tstz('created_at').notNull().defaultNow()
export const updatedAt = () =>
  tstz('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date())

/** 列舉值用 text + CHECK，產生 `col IN ('a', 'b')` */
export function inList(column: string, values: readonly string[]) {
  return sql.raw(`"${column}" IN (${values.map((v) => `'${v}'`).join(', ')})`)
}
