import pino from 'pino'
import { REDACT_PATHS, type LogLevel, type Logger } from './logger-types.ts'

export type { Logger, LogLevel } from './logger-types.ts'

export function createLogger(level: LogLevel): Logger {
  return pino({
    level,
    base: undefined,
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: { level: (label) => ({ level: label }) },
    redact: { paths: REDACT_PATHS, censor: '[redacted]' },
  })
}
