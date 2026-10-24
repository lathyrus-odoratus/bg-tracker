import { sql } from 'drizzle-orm'
import { check, index, integer, pgTable, text, uuid, type AnyPgColumn } from 'drizzle-orm/pg-core'
import { createdAt, id, updatedAt } from './columns.ts'
import { users } from './identity.ts'

/**
 * 留言板：留言與回覆都在同一層，回覆只記回覆哪一則。
 * `id` 是遞增的編號（畫面上的 #12）；`content` 是目前的內容，每一版都另外存在 post_revisions。
 */
export const posts = pgTable(
  'posts',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    authorId: uuid('author_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    replyToId: integer('reply_to_id').references((): AnyPgColumn => posts.id, {
      onDelete: 'restrict',
    }),
    content: text('content').notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index('posts_reply_to_id').on(t.replyToId),
    check('posts_content_length', sql`char_length("content") BETWEEN 1 AND 2000`),
    check('posts_reply_not_self', sql`"reply_to_id" IS NULL OR "reply_to_id" < "id"`),
  ],
)

/** 每一版的內容（含第一版），新增與編輯時寫入；編輯紀錄就是這張表 */
export const postRevisions = pgTable(
  'post_revisions',
  {
    id: id(),
    postId: integer('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'restrict' }),
    content: text('content').notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    index('post_revisions_post_id_created_at').on(t.postId, t.createdAt),
    check('post_revisions_content_length', sql`char_length("content") BETWEEN 1 AND 2000`),
  ],
)
