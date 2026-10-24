import { createMiddleware } from 'hono/factory'
import type { Context } from 'hono'
import type { AppEnv } from '../env.ts'
import { AppError } from '../errors.ts'

/**
 * 程序內的固定視窗限流（單一實例）。
 * 數值是暫定的，之後依實際使用調整。
 */
export class RateLimiter {
  readonly limit: number
  readonly windowMs: number
  private readonly hits = new Map<string, { count: number; resetAt: number }>()

  constructor(limit: number, windowMs: number) {
    this.limit = limit
    this.windowMs = windowMs
  }

  /** 記一次；超過上限回傳 false */
  hit(key: string, now: number): boolean {
    const entry = this.hits.get(key)
    if (!entry || entry.resetAt <= now) {
      this.hits.set(key, { count: 1, resetAt: now + this.windowMs })
      this.sweep(now)
      return true
    }
    entry.count += 1
    return entry.count <= this.limit
  }

  private sweep(now: number) {
    if (this.hits.size < 10_000) return
    for (const [key, entry] of this.hits) if (entry.resetAt <= now) this.hits.delete(key)
  }
}

export interface RateLimits {
  /** 登入：每個 IP 每 60 秒 10 次 */
  login: RateLimiter
}

export function createRateLimits(): RateLimits {
  return { login: new RateLimiter(10, 60_000) }
}

/** 未登入的請求以 CF-Connecting-IP 為 key（只有 Cloudflare Tunnel 連得進來，可以信任） */
export function clientIp(c: Context) {
  return c.req.header('cf-connecting-ip') ?? 'local'
}

export function rateLimit(
  pick: (limits: RateLimits) => RateLimiter,
  key: (c: Context<AppEnv>) => string,
) {
  return createMiddleware<AppEnv>(async (c, next) => {
    const deps = c.get('deps')
    if (!pick(deps.rateLimits).hit(key(c), deps.now().getTime())) {
      throw new AppError('rate_limited', 429, 'Too many requests')
    }
    await next()
  })
}
