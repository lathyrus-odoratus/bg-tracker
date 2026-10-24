import { randomUUID } from 'node:crypto'
import { createMiddleware } from 'hono/factory'
import type { ErrorHandler, NotFoundHandler } from 'hono'
import type { ErrorResponse } from '@bg-tracker/shared'
import { AppError } from '../errors.ts'
import type { AppEnv, Deps } from '../env.ts'

const REQUEST_ID_RE = /^[\w-]{1,64}$/

/** 每個請求：requestId、child logger、結束時一行 access log */
export function requestContext(deps: Deps) {
  return createMiddleware<AppEnv>(async (c, next) => {
    const incoming = c.req.header('x-request-id')
    const requestId = incoming && REQUEST_ID_RE.test(incoming) ? incoming : randomUUID()
    c.set('deps', deps)
    c.set('requestId', requestId)
    c.set('log', deps.logger.child({ requestId }))
    c.header('x-request-id', requestId)
    const started = performance.now()
    await next()
    // path 不含 query string：OAuth 的 code 不會進 log
    c.get('log').info(
      {
        method: c.req.method,
        path: c.req.path,
        status: c.res.status,
        durationMs: Math.round(performance.now() - started),
        userId: c.get('userId'),
      },
      'request',
    )
  })
}

function errorBody(
  requestId: string,
  code: string,
  message: string,
  details?: unknown,
): ErrorResponse {
  return { error: { code, message, requestId, ...(details === undefined ? {} : { details }) } }
}

export const onError: ErrorHandler<AppEnv> = (err, c) => {
  const requestId = c.get('requestId') ?? 'unknown'
  if (err instanceof AppError) {
    if (err.status >= 500) c.get('log')?.warn({ err, code: err.code }, 'upstream error')
    return c.json(errorBody(requestId, err.code, err.message, err.details), err.status)
  }
  c.get('log')?.error({ err }, 'unhandled error')
  return c.json(errorBody(requestId, 'internal_error', 'Internal server error'), 500)
}

export const onApiNotFound: NotFoundHandler<AppEnv> = (c) =>
  c.json(errorBody(c.get('requestId'), 'not_found', 'Not found'), 404)
