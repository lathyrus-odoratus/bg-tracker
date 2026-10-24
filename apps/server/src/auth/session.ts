import { createHash, randomBytes } from 'node:crypto'
import { eq, lt } from 'drizzle-orm'
import type { Db } from '../db/client.ts'
import { sessions, users, type SystemRole } from '../db/schema/index.ts'

const DAY = 24 * 60 * 60 * 1000

/** 滑動到期的期限 */
export const SESSION_TTL_MS = 30 * DAY
/** 剩餘時間少於「期限 − 這個值」才延長，一般請求不寫 DB */
const EXTEND_AFTER_MS = DAY

export interface SessionUser {
  id: string
  displayName: string
  systemRole: SystemRole
}

export interface ValidSession {
  tokenHash: string
  expiresAt: Date
  /** 這次驗證有延長期限（要同時更新 cookie 的 Max-Age） */
  extended: boolean
  user: SessionUser
}

export function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export async function createSession(db: Db, now: Date, userId: string) {
  const token = randomBytes(32).toString('base64url')
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS)
  await db.insert(sessions).values({ tokenHash: hashToken(token), userId, expiresAt })
  return { token, expiresAt }
}

/** 過期或不存在的 token 回傳 null（視同未登入）。角色每次從 DB 讀，變更立即生效 */
export async function validateSession(
  db: Db,
  now: Date,
  token: string,
): Promise<ValidSession | null> {
  const tokenHash = hashToken(token)
  const [row] = await db
    .select({
      expiresAt: sessions.expiresAt,
      user: { id: users.id, displayName: users.displayName, systemRole: users.systemRole },
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(eq(sessions.tokenHash, tokenHash))
  if (!row || row.expiresAt <= now) return null

  const remaining = row.expiresAt.getTime() - now.getTime()
  if (remaining >= SESSION_TTL_MS - EXTEND_AFTER_MS) {
    return { tokenHash, ...row, extended: false }
  }
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS)
  await db.update(sessions).set({ expiresAt }).where(eq(sessions.tokenHash, tokenHash))
  return { tokenHash, ...row, expiresAt, extended: true }
}

export async function deleteSession(db: Db, tokenHash: string) {
  await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash))
}

export async function deleteExpiredSessions(db: Db, now: Date) {
  const deleted = await db
    .delete(sessions)
    .where(lt(sessions.expiresAt, now))
    .returning({ tokenHash: sessions.tokenHash })
  return deleted.length
}
