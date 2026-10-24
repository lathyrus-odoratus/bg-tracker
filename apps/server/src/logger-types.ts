/** logger 的介面與共用設定 */

export type LogFn = {
  (obj: object, msg?: string): void
  (msg: string): void
}

/** app 只用到這些方法；實作是 pino */
export interface Logger {
  fatal: LogFn
  error: LogFn
  warn: LogFn
  info: LogFn
  debug: LogFn
  trace: LogFn
  child(bindings: Record<string, unknown>): Logger
}

export type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent'

/** 機密不進 log：就算不小心把 header 或 token 放進 log 物件，也會被遮蔽 */
export const REDACT_PATHS = [
  'authorization',
  'cookie',
  'headers.authorization',
  'headers.cookie',
  'req.headers.authorization',
  'req.headers.cookie',
  'token',
]
