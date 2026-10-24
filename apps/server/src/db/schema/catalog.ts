import { sql } from 'drizzle-orm'
import {
  check,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'
import { createdAt, id, updatedAt } from './columns.ts'

/** 桌遊。名稱不分大小寫唯一 */
export const games = pgTable(
  'games',
  {
    id: id(),
    name: text('name').notNull(),
    minPlayers: integer('min_players'),
    maxPlayers: integer('max_players'),
    /** 一場大約幾分鐘 */
    playMinutes: integer('play_minutes'),
    /** BoardGameGeek 的 id；之後做相似度（重量等）時用來補資料 */
    bggId: integer('bgg_id'),
    /** BGA 的遊戲代號（`gamepanel?game=<slug>`）；由 `scripts/bga-import.ts` 填入 */
    bgaSlug: text('bga_slug'),
    /** 自訂圖片；沒有的話用 BGA 代號組出 BGA 的圖片 */
    imageUrl: text('image_url'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex('games_name_lower').on(sql`lower(${t.name})`),
    uniqueIndex('games_bgg_id').on(t.bggId),
    uniqueIndex('games_bga_slug').on(t.bgaSlug),
    check('games_name_length', sql`char_length("name") BETWEEN 1 AND 100`),
    check(
      'games_players',
      sql`("min_players" IS NULL OR "min_players" >= 1) AND ("max_players" IS NULL OR "min_players" IS NULL OR "max_players" >= "min_players")`,
    ),
    check('games_play_minutes', sql`"play_minutes" IS NULL OR "play_minutes" > 0`),
    check('games_bga_slug_format', sql`"bga_slug" ~ '^[a-z0-9]+$'`),
    check('games_image_url', sql`"image_url" LIKE 'https://%'`),
  ],
)

/** 機制。不分階層（圓形圖不做 edge bundling 的階層） */
export const mechanisms = pgTable(
  'mechanisms',
  {
    id: id(),
    name: text('name').notNull(),
    description: text('description').notNull().default(''),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex('mechanisms_name_lower').on(sql`lower(${t.name})`),
    check('mechanisms_name_length', sql`char_length("name") BETWEEN 1 AND 100`),
  ],
)

export const gameMechanisms = pgTable(
  'game_mechanisms',
  {
    gameId: uuid('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'restrict' }),
    mechanismId: uuid('mechanism_id')
      .notNull()
      .references(() => mechanisms.id, { onDelete: 'restrict' }),
  },
  (t) => [
    primaryKey({ columns: [t.gameId, t.mechanismId] }),
    index('game_mechanisms_mechanism_id').on(t.mechanismId),
  ],
)
