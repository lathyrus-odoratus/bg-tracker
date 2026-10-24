import { sql } from 'drizzle-orm'
import { check, index, pgTable, primaryKey, text, unique, uuid } from 'drizzle-orm/pg-core'
import { SYSTEM_ROLES } from '@bg-tracker/shared'
import { createdAt, id, inList, tstz, updatedAt } from './columns.ts'

export { SYSTEM_ROLES }
export const IDENTITY_PROVIDERS = ['discord'] as const

export type { SystemRole } from '@bg-tracker/shared'

export const users = pgTable(
  'users',
  {
    id: id(),
    displayName: text('display_name').notNull(),
    systemRole: text('system_role', { enum: SYSTEM_ROLES }).notNull().default('user'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  () => [
    check('users_display_name_length', sql`char_length("display_name") BETWEEN 1 AND 50`),
    check('users_system_role', inList('system_role', SYSTEM_ROLES)),
  ],
)

/** 登入身份；預留多種登入方式（目前只有 Discord）。不存 access token 與頭像 URL */
export const userIdentities = pgTable(
  'user_identities',
  {
    provider: text('provider', { enum: IDENTITY_PROVIDERS }).notNull(),
    providerUserId: text('provider_user_id').notNull(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    username: text('username').notNull(),
    globalName: text('global_name'),
    /** Discord avatar hash；URL 在 API 層組出 */
    avatar: text('avatar'),
    updatedAt: updatedAt(),
  },
  (t) => [
    primaryKey({ columns: [t.provider, t.providerUserId] }),
    unique('user_identities_user_provider').on(t.userId, t.provider),
    check('user_identities_provider', inList('provider', IDENTITY_PROVIDERS)),
  ],
)

/** DB 只存 token 的 SHA-256 hash */
export const sessions = pgTable(
  'sessions',
  {
    tokenHash: text('token_hash').primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    expiresAt: tstz('expires_at').notNull(),
    createdAt: createdAt(),
  },
  (t) => [index('sessions_user_id').on(t.userId), index('sessions_expires_at').on(t.expiresAt)],
)
