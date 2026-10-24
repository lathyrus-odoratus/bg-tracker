import { describe, expect, it } from 'vitest'
import { healthResponseSchema, publicConfigSchema } from '@bg-tracker/shared'
import { createApp } from '../src/app.ts'
import { createTestDeps } from './helpers/deps.ts'

const app = createApp(createTestDeps())

describe('GET /api/health', () => {
  it('回傳版本與 commit', async () => {
    const res = await app.request('/api/health')
    expect(res.status).toBe(200)
    expect(healthResponseSchema.parse(await res.json())).toEqual({
      status: 'ok',
      version: '0.0.0-test',
      commit: 'testsha',
    })
  })

  it('沿用請求的 x-request-id，沒有就產生', async () => {
    const given = await app.request('/api/health', { headers: { 'x-request-id': 'abc-123' } })
    expect(given.headers.get('x-request-id')).toBe('abc-123')
    const generated = await app.request('/api/health')
    expect(generated.headers.get('x-request-id')).toMatch(/^[0-9a-f-]{36}$/)
  })
})

describe('GET /api/config', () => {
  it('只回傳公開設定、不快取', async () => {
    const res = await app.request('/api/config')
    expect(res.headers.get('cache-control')).toBe('no-store')
    const body = await res.json()
    expect(publicConfigSchema.strict().parse(body)).toEqual({ appUrl: 'http://localhost:5180' })
  })
})
