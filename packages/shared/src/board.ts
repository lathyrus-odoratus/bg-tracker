import { z } from 'zod'

export const POST_MAX_LENGTH = 2000
/** 留言板一次載入幾則 */
export const POSTS_PAGE_SIZE = 25

const content = z.string().trim().min(1).max(POST_MAX_LENGTH)

/** `POST /api/posts` */
export const postInputSchema = z.object({
  content,
  /** 回覆哪一則（編號）；不是回覆就不給 */
  replyTo: z.number().int().positive().nullable().optional(),
})

/** `PUT /api/posts/:number` */
export const postEditSchema = z.object({ content })

/** `GET /api/posts?before=<編號>`：編號比它小的那一頁（新的在前）；不給就是最新的一頁 */
export const postsQuerySchema = z.object({ before: z.coerce.number().int().positive().optional() })

export const postNumberParamSchema = z.object({ number: z.coerce.number().int().positive() })

/** `GET /api/posts` 的一則；`editedAt` 只有編輯過才有 */
export const postSchema = z.object({
  number: z.number(),
  author: z.object({ id: z.string(), displayName: z.string(), avatarUrl: z.string() }),
  replyTo: z.number().nullable(),
  content: z.string(),
  createdAt: z.string(),
  editedAt: z.string().nullable(),
  /** 編輯過幾次（不含第一版） */
  editCount: z.number(),
})
export type Post = z.infer<typeof postSchema>

/** `GET /api/posts`：`nextBefore` 是下一頁的 `before`，沒有更多時為 null */
export const postsPageSchema = z.object({
  posts: z.array(postSchema),
  nextBefore: z.number().nullable(),
})
export type PostsPage = z.infer<typeof postsPageSchema>

/** `GET /api/posts/:number/revisions`：每一版，新的在前 */
export const postRevisionSchema = z.object({ content: z.string(), createdAt: z.string() })
export type PostRevision = z.infer<typeof postRevisionSchema>
