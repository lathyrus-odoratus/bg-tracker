import type { Deps } from '../env.ts'
import { deleteExpiredSessions } from './session.ts'

const INTERVAL_MS = 60 * 60 * 1000

/** 啟動時跑一次，之後每小時刪除過期的 session（單一實例，程序內排程即可） */
export function startSessionCleanup({ db, now, logger }: Deps) {
  const run = async () => {
    try {
      const count = await deleteExpiredSessions(db, now())
      if (count > 0) logger.info({ count }, 'expired sessions deleted')
    } catch (err) {
      logger.error({ err }, 'session cleanup failed')
    }
  }
  void run()
  const timer = setInterval(run, INTERVAL_MS)
  timer.unref()
  return () => clearInterval(timer)
}
