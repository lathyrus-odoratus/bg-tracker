import { Hono } from 'hono'
import { asc, count, desc, eq } from 'drizzle-orm'
import {
  idParamSchema,
  topWishesQuerySchema,
  type GameDetail,
  type GameListItem,
  type Graph,
  type MechanismDetail,
  type MechanismListItem,
  type TopWish,
} from '@bg-tracker/shared'
import type { AppEnv } from '../env.ts'
import { AppError } from '../errors.ts'
import { validate } from '../http/validate.ts'
import { currentUser, requireAuth } from '../auth/middleware.ts'
import { gameMechanisms, games, mechanisms, users, wishes } from '../db/schema/index.ts'
import { listGamePlayers, listGamePlays } from '../plays/queries.ts'
import { getWeightSummary } from '../plays/weights.ts'

const gameColumns = {
  id: games.id,
  name: games.name,
  minPlayers: games.minPlayers,
  maxPlayers: games.maxPlayers,
  playMinutes: games.playMinutes,
  bggId: games.bggId,
  bgaSlug: games.bgaSlug,
  imageUrl: games.imageUrl,
}

/**
 * 遊戲與機制：整個網站都要登入。掛在 API 根路徑，所以 requireAuth 掛在每個 route 上
 * （用 `.use('*')` 會連 /api/health、/api/config 一起擋掉）
 */
export const catalogRoutes = new Hono<AppEnv>()
  .get('/graph', requireAuth, async (c) => {
    const { db } = c.get('deps')
    const [gameRows, mechanismRows, links] = await Promise.all([
      db.select({ id: games.id, name: games.name }).from(games).orderBy(asc(games.name)),
      db
        .select({ id: mechanisms.id, name: mechanisms.name })
        .from(mechanisms)
        .orderBy(asc(mechanisms.name)),
      db
        .select({ gameId: gameMechanisms.gameId, mechanismId: gameMechanisms.mechanismId })
        .from(gameMechanisms),
    ])
    const body: Graph = { games: gameRows, mechanisms: mechanismRows, links }
    return c.json(body)
  })
  .get('/wishes/top', requireAuth, validate('query', topWishesQuerySchema), async (c) => {
    const { db } = c.get('deps')
    const { k } = c.req.valid('query')
    const rows = await db
      .select({ gameId: games.id, name: games.name, count: count() })
      .from(wishes)
      .innerJoin(games, eq(games.id, wishes.gameId))
      .groupBy(games.id)
      .orderBy(desc(count()), asc(games.name))
      .limit(k)
    const body: TopWish[] = rows
    return c.json(body)
  })
  .get('/games', requireAuth, async (c) => {
    const { db } = c.get('deps')
    const rows = await db
      .select({ ...gameColumns, mechanismCount: count(gameMechanisms.mechanismId) })
      .from(games)
      .leftJoin(gameMechanisms, eq(gameMechanisms.gameId, games.id))
      .groupBy(games.id)
      .orderBy(asc(games.name))
    const body: GameListItem[] = rows
    return c.json(body)
  })
  .get('/games/:id', requireAuth, validate('param', idParamSchema), async (c) => {
    const { db } = c.get('deps')
    const { id } = c.req.valid('param')
    const [game] = await db.select(gameColumns).from(games).where(eq(games.id, id))
    if (!game) throw new AppError('not_found', 404, 'Game not found')
    const [mechanismRows, plays, wishers, players] = await Promise.all([
      db
        .select({ id: mechanisms.id, name: mechanisms.name })
        .from(gameMechanisms)
        .innerJoin(mechanisms, eq(mechanisms.id, gameMechanisms.mechanismId))
        .where(eq(gameMechanisms.gameId, id))
        .orderBy(asc(mechanisms.name)),
      listGamePlays(db, id),
      db
        .select({ id: users.id, displayName: users.displayName })
        .from(wishes)
        .innerJoin(users, eq(users.id, wishes.userId))
        .where(eq(wishes.gameId, id))
        .orderBy(asc(wishes.createdAt)),
      listGamePlayers(db, id),
    ])
    const weight = await getWeightSummary(db, id, currentUser(c).id)
    const body: GameDetail = { ...game, mechanisms: mechanismRows, plays, wishers, players, weight }
    return c.json(body)
  })
  .get('/mechanisms', requireAuth, async (c) => {
    const { db } = c.get('deps')
    const rows = await db
      .select({
        id: mechanisms.id,
        name: mechanisms.name,
        description: mechanisms.description,
        gameCount: count(gameMechanisms.gameId),
      })
      .from(mechanisms)
      .leftJoin(gameMechanisms, eq(gameMechanisms.mechanismId, mechanisms.id))
      .groupBy(mechanisms.id)
      .orderBy(desc(count(gameMechanisms.gameId)), asc(mechanisms.name))
    const body: MechanismListItem[] = rows
    return c.json(body)
  })
  .get('/mechanisms/:id', requireAuth, validate('param', idParamSchema), async (c) => {
    const { db } = c.get('deps')
    const { id } = c.req.valid('param')
    const [mechanism] = await db
      .select({ id: mechanisms.id, name: mechanisms.name, description: mechanisms.description })
      .from(mechanisms)
      .where(eq(mechanisms.id, id))
    if (!mechanism) throw new AppError('not_found', 404, 'Mechanism not found')
    const gameRows = await db
      .select({ id: games.id, name: games.name, bgaSlug: games.bgaSlug, imageUrl: games.imageUrl })
      .from(gameMechanisms)
      .innerJoin(games, eq(games.id, gameMechanisms.gameId))
      .where(eq(gameMechanisms.mechanismId, id))
      .orderBy(asc(games.name))
    const body: MechanismDetail = { ...mechanism, games: gameRows }
    return c.json(body)
  })
