import { sql } from 'drizzle-orm'
import {
  check,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  unique,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'
import { createdAt, id, inList, tstz, updatedAt } from './columns.ts'
import { users } from './identity.ts'
import { games } from './catalog.ts'

/** 外部平台。目前只有 BGA；手動紀錄之後再加（`manual`） */
export const PLAY_SOURCES = ['bga'] as const
export const EXTERNAL_PROVIDERS = ['bga'] as const

/**
 * 外部平台帳號 → 使用者，由管理員指定。
 * 遊玩紀錄的參與者只存外部名稱，綁定後過去的紀錄自動連上這位使用者。
 */
export const externalAccounts = pgTable(
  'external_accounts',
  {
    provider: text('provider', { enum: EXTERNAL_PROVIDERS }).notNull(),
    externalName: text('external_name').notNull(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    assignedBy: uuid('assigned_by')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    createdAt: createdAt(),
  },
  (t) => [
    primaryKey({ columns: [t.provider, t.externalName] }),
    // BGA 名稱不分大小寫
    uniqueIndex('external_accounts_name_lower').on(t.provider, sql`lower(${t.externalName})`),
    index('external_accounts_user_id').on(t.userId),
    check('external_accounts_provider', inList('provider', EXTERNAL_PROVIDERS)),
  ],
)

/**
 * 一場遊玩紀錄。BGA 的紀錄以 table id 去重（同一桌只會登錄一次）。
 * 沒有 API，由登入的使用者貼上對局網址手動登錄。
 */
export const plays = pgTable(
  'plays',
  {
    id: id(),
    gameId: uuid('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'restrict' }),
    playedAt: tstz('played_at').notNull(),
    source: text('source', { enum: PLAY_SOURCES }).notNull(),
    /** BGA 的 table id */
    externalId: text('external_id'),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    createdAt: createdAt(),
  },
  (t) => [
    unique('plays_source_external_id').on(t.source, t.externalId),
    index('plays_game_id_played_at').on(t.gameId, t.playedAt),
    check('plays_source', inList('source', PLAY_SOURCES)),
    check('plays_external_id', sql`"source" <> 'bga' OR "external_id" ~ '^[0-9]+$'`),
  ],
)

/**
 * 參與者。BGA 的紀錄只存 BGA 名稱，透過 external_accounts 對應到使用者；
 * 沒有綁定的人（朋友、路人）也照樣記下來。
 */
export const playParticipants = pgTable(
  'play_participants',
  {
    playId: uuid('play_id')
      .notNull()
      .references(() => plays.id, { onDelete: 'cascade' }),
    externalName: text('external_name').notNull(),
    /** 名次（1 起算，同分可以並列）；不知道就留空 */
    rank: integer('rank'),
    score: integer('score'),
  },
  (t) => [
    primaryKey({ columns: [t.playId, t.externalName] }),
    index('play_participants_name_lower').on(sql`lower(${t.externalName})`),
    check('play_participants_name_length', sql`char_length("external_name") BETWEEN 1 AND 50`),
    check('play_participants_rank', sql`"rank" IS NULL OR "rank" >= 1`),
  ],
)

/** 想玩清單 */
export const wishes = pgTable(
  'wishes',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    gameId: uuid('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'restrict' }),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.gameId] }), index('wishes_game_id').on(t.gameId)],
)

/**
 * 自己標的「玩過」。有遊玩紀錄的不用標也算玩過；
 * 玩過幾次、上次遊玩只從遊玩紀錄算，這裡只記「玩過」這件事
 */
export const playedMarks = pgTable(
  'played_marks',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    gameId: uuid('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'restrict' }),
    createdAt: createdAt(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.gameId] }),
    index('played_marks_game_id').on(t.gameId),
  ],
)

/** 重度範圍 1.0–9.9、間距 0.1；存成整數十分位（10–99），避免小數誤差 */
export const WEIGHT_MIN_TENTHS = 10
export const WEIGHT_MAX_TENTHS = 99

/** 玩家替遊戲評的複雜度（重度），每人每款一票，可以改、可以取消 */
export const weightVotes = pgTable(
  'weight_votes',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    gameId: uuid('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'restrict' }),
    weightTenths: integer('weight_tenths').notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.gameId] }),
    index('weight_votes_game_id').on(t.gameId),
    check(
      'weight_votes_range',
      sql`"weight_tenths" BETWEEN ${sql.raw(String(WEIGHT_MIN_TENTHS))} AND ${sql.raw(String(WEIGHT_MAX_TENTHS))}`,
    ),
  ],
)
