import { Hono } from 'hono'
import { and, asc, count, desc, eq } from 'drizzle-orm'
import {
  postEditSchema,
  postInputSchema,
  postNumberParamSchema,
  type Post,
  type PostRevision,
} from '@bg-tracker/shared'
import type { AppEnv } from '../env.ts'
import type { Executor } from '../db/client.ts'
import { AppError } from '../errors.ts'
import { validate } from '../http/validate.ts'
import { currentUser, requireAuth } from '../auth/middleware.ts'
import { discordAvatarUrl } from '../auth/avatar.ts'
import { postRevisions, posts, userIdentities, users } from '../db/schema/index.ts'

/** 留言（含作者與編輯次數）；不給 number 就是全部，依編號由舊到新 */
async function selectPosts(db: Executor, number?: number): Promise<Post[]> {
  const revisions = db
    .select({ postId: postRevisions.postId, n: count().as('n') })
    .from(postRevisions)
    .groupBy(postRevisions.postId)
    .as('revisions')
  const rows = await db
    .select({
      number: posts.id,
      replyTo: posts.replyToId,
      content: posts.content,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      revisionCount: revisions.n,
      authorId: users.id,
      displayName: users.displayName,
      discordId: userIdentities.providerUserId,
      avatar: userIdentities.avatar,
    })
    .from(posts)
    .innerJoin(users, eq(users.id, posts.authorId))
    .innerJoin(
      userIdentities,
      and(eq(userIdentities.userId, users.id), eq(userIdentities.provider, 'discord')),
    )
    .leftJoin(revisions, eq(revisions.postId, posts.id))
    .where(number === undefined ? undefined : eq(posts.id, number))
    .orderBy(asc(posts.id))
  return rows.map((r) => {
    const editCount = Math.max(0, Number(r.revisionCount ?? 1) - 1)
    return {
      number: r.number,
      author: {
        id: r.authorId,
        displayName: r.displayName,
        avatarUrl: discordAvatarUrl(r.discordId, r.avatar),
      },
      replyTo: r.replyTo,
      content: r.content,
      createdAt: r.createdAt.toISOString(),
      editedAt: editCount > 0 ? r.updatedAt.toISOString() : null,
      editCount,
    }
  })
}

/** 留言板：只有登入的人能看與寫；只有作者能編輯，每一版都留著 */
export const boardRoutes = new Hono<AppEnv>()
  .use('*', requireAuth)
  .get('/', async (c) => {
    const body: Post[] = await selectPosts(c.get('deps').db)
    return c.json(body)
  })
  .post('/', validate('json', postInputSchema), async (c) => {
    const { db } = c.get('deps')
    const { content, replyTo } = c.req.valid('json')
    const author = currentUser(c)
    const post = await db.transaction(async (tx) => {
      if (replyTo) {
        const [target] = await tx.select({ id: posts.id }).from(posts).where(eq(posts.id, replyTo))
        if (!target) throw new AppError('reply_target_not_found', 400, `找不到 #${replyTo}`)
      }
      const [row] = await tx
        .insert(posts)
        .values({ authorId: author.id, replyToId: replyTo ?? null, content })
        .returning({ id: posts.id })
      await tx.insert(postRevisions).values({ postId: row!.id, content })
      return (await selectPosts(tx, row!.id))[0]!
    })
    c.get('log').info({ postNumber: post.number }, 'post created')
    return c.json(post, 201)
  })
  .put(
    '/:number',
    validate('param', postNumberParamSchema),
    validate('json', postEditSchema),
    async (c) => {
      const { db } = c.get('deps')
      const { number } = c.req.valid('param')
      const { content } = c.req.valid('json')
      const editor = currentUser(c)
      const post = await db.transaction(async (tx) => {
        const [current] = await tx
          .select({ authorId: posts.authorId, content: posts.content })
          .from(posts)
          .where(eq(posts.id, number))
          .for('update')
        if (!current) throw new AppError('not_found', 404, 'Post not found')
        if (current.authorId !== editor.id) {
          throw new AppError('forbidden', 403, '只有作者可以編輯')
        }
        // 內容沒變就不算一次編輯
        if (current.content !== content) {
          await tx.update(posts).set({ content }).where(eq(posts.id, number))
          await tx.insert(postRevisions).values({ postId: number, content })
        }
        return (await selectPosts(tx, number))[0]!
      })
      return c.json(post)
    },
  )
  .get('/:number/revisions', validate('param', postNumberParamSchema), async (c) => {
    const { db } = c.get('deps')
    const { number } = c.req.valid('param')
    const rows = await db
      .select({ content: postRevisions.content, createdAt: postRevisions.createdAt })
      .from(postRevisions)
      .where(eq(postRevisions.postId, number))
      .orderBy(desc(postRevisions.createdAt), desc(postRevisions.id))
    if (!rows.length) throw new AppError('not_found', 404, 'Post not found')
    const body: PostRevision[] = rows.map((r) => ({
      content: r.content,
      createdAt: r.createdAt.toISOString(),
    }))
    return c.json(body)
  })
