import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { Env, Hono } from 'hono'
import { serveStatic } from '@hono/node-server/serve-static'

/** 不 fallback 到 index.html 的路徑前綴：這些路徑由 server 自己處理，找不到要回 404 */
const SERVER_PREFIXES = ['/api/', '/auth/']

export function serveWeb<E extends Env>(app: Hono<E>, distDir: string) {
  const root = path.relative(process.cwd(), distDir)
  app.use('*', async (c, next) => {
    if (SERVER_PREFIXES.some((p) => c.req.path.startsWith(p))) return next()
    return serveStatic({ root })(c, next)
  })
  app.get('*', async (c, next) => {
    if (SERVER_PREFIXES.some((p) => c.req.path.startsWith(p))) return next()
    const html = await readFile(path.join(distDir, 'index.html'), 'utf8')
    return c.html(html)
  })
}
