import { Hono } from 'hono'
import type { HealthResponse, PublicConfig } from '@bg-tracker/shared'
import type { AppEnv, Deps } from './env.ts'
import { onApiNotFound, onError, requestContext } from './http/middleware.ts'
import { serveWeb } from './web.ts'
import { loadSession } from './auth/middleware.ts'
import { authApiRoutes, meRoutes } from './auth/routes.ts'
import { webOAuthRoutes } from './auth/web-oauth.ts'
import { catalogRoutes } from './catalog/routes.ts'
import { adminCatalogRoutes } from './admin/catalog.ts'
import { boardRoutes } from './board/routes.ts'
import { markRoutes } from './plays/mark-routes.ts'

export interface AppOptions {
  /** web 的 build 輸出目錄；不給就不提供 SPA（例如測試） */
  webDistDir?: string
}

function createApiRoutes() {
  return new Hono<AppEnv>()
    .use('*', loadSession)
    .route('/auth', authApiRoutes)
    .route('/me', meRoutes)
    .route('/me', markRoutes)
    .route('/', catalogRoutes)
    .route('/admin', adminCatalogRoutes)
    .route('/posts', boardRoutes)
    .get('/health', (c) => {
      const { config } = c.get('deps')
      const body: HealthResponse = { status: 'ok', version: config.version, commit: config.commit }
      return c.json(body)
    })
    .get('/config', (c) => {
      const { config } = c.get('deps')
      const body: PublicConfig = {
        appUrl: config.appUrl,
        version: config.version,
        commit: config.commit,
      }
      c.header('Cache-Control', 'no-store')
      return c.json(body)
    })
}

/** 前端用 `hc<ApiType>('/api')` 取得型別 */
export type ApiType = ReturnType<typeof createApiRoutes>

export function createApp(deps: Deps, options: AppOptions = {}) {
  const app = new Hono<AppEnv>()
  app.use('*', requestContext(deps))
  app.onError(onError)
  app.route('/api', createApiRoutes())
  app.route('/auth', webOAuthRoutes)
  app.all('/api/*', onApiNotFound)
  if (options.webDistDir) serveWeb(app, options.webDistDir)
  return app
}
