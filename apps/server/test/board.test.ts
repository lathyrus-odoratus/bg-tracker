import { describe, expect, it } from 'vitest'
import { postRevisionSchema, postSchema } from '@bg-tracker/shared'
import { createApp } from '../src/app.ts'
import { useTestDb } from './helpers/db.ts'
import { createTestDeps } from './helpers/deps.ts'
import { createTestUser, loginAs } from './helpers/auth.ts'
import { errorCode, jsonBody } from './helpers/http.ts'

const db = useTestDb()
const app = createApp(createTestDeps({ db }))

async function login(displayName: string) {
  const user = await createTestUser(db, { displayName })
  return { user, headers: (await loginAs(db, user)).headers }
}

async function post(headers: Record<string, string>, body: unknown) {
  return app.request('/api/posts', { method: 'POST', ...jsonBody(body, headers) })
}

describe('留言板', () => {
  it('未登入：讀、寫、看紀錄都是 401', async () => {
    expect((await app.request('/api/posts')).status).toBe(401)
    expect((await post({}, { content: 'hi' })).status).toBe(401)
    expect((await app.request('/api/posts/1/revisions')).status).toBe(401)
  })

  it('留言與回覆在同一層，依編號排序', async () => {
    const alice = await login('Alice')
    const bob = await login('Bob')
    const first = postSchema.parse(
      await (await post(alice.headers, { content: '  今晚玩什麼？ ' })).json(),
    )
    expect(first).toMatchObject({
      number: 1,
      replyTo: null,
      content: '今晚玩什麼？',
      editCount: 0,
      editedAt: null,
    })
    const reply = await post(bob.headers, { content: '七大奇蹟', replyTo: first.number })
    expect(reply.status).toBe(201)

    const list = postSchema
      .array()
      .parse(await (await app.request('/api/posts', { headers: bob.headers })).json())
    expect(list.map((p) => [p.number, p.replyTo, p.author.displayName])).toEqual([
      [1, null, 'Alice'],
      [2, 1, 'Bob'],
    ])
  })

  it('回覆不存在的留言 400；空白內容、超過 2000 字 400', async () => {
    const { headers } = await login('Alice')
    const missing = await post(headers, { content: 'hi', replyTo: 99 })
    expect(missing.status).toBe(400)
    expect(await errorCode(missing)).toBe('reply_target_not_found')
    expect((await post(headers, { content: '   ' })).status).toBe(400)
    expect((await post(headers, { content: '字'.repeat(2001) })).status).toBe(400)
  })

  it('作者可以編輯，每一版都留著（新的在前）；內容沒變不算編輯', async () => {
    const { headers } = await login('Alice')
    await post(headers, { content: '第一版' })
    const edit = (content: string) =>
      app.request('/api/posts/1', { method: 'PUT', ...jsonBody({ content }, headers) })

    expect(postSchema.parse(await (await edit('第二版')).json())).toMatchObject({
      content: '第二版',
      editCount: 1,
    })
    await edit('第三版')
    const same = postSchema.parse(await (await edit('第三版')).json())
    expect(same.editCount).toBe(2)
    expect(same.editedAt).not.toBeNull()

    const revisions = postRevisionSchema
      .array()
      .parse(await (await app.request('/api/posts/1/revisions', { headers })).json())
    expect(revisions.map((r) => r.content)).toEqual(['第三版', '第二版', '第一版'])
  })

  it('別人的留言不能編輯 403；不存在 404', async () => {
    const alice = await login('Alice')
    const bob = await login('Bob')
    await post(alice.headers, { content: 'Alice 的留言' })
    const forbidden = await app.request('/api/posts/1', {
      method: 'PUT',
      ...jsonBody({ content: '改掉' }, bob.headers),
    })
    expect(forbidden.status).toBe(403)
    const missing = await app.request('/api/posts/99', {
      method: 'PUT',
      ...jsonBody({ content: 'x' }, bob.headers),
    })
    expect(missing.status).toBe(404)
    expect((await app.request('/api/posts/99/revisions', { headers: bob.headers })).status).toBe(
      404,
    )
  })
})
