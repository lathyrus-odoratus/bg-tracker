import { defineConfig } from 'vitest/config'

// globalSetup 讀不到 test.env，所以直接設在 process.env（測試 worker 會繼承）
process.env.TEST_DATABASE_URL ??= 'postgres://bg:bg@localhost:5434/bg_tracker_test'

export default defineConfig({
  test: {
    // 測試共用同一個資料庫，檔案之間不平行跑，避免互相清掉資料
    fileParallelism: false,
    globalSetup: ['./test/global-setup.ts'],
  },
})
