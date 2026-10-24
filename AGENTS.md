# AGENTS.md

桌遊機制圖譜：以機制為中心的桌遊知識圖譜，記錄遊玩紀錄與想玩清單、建立教學路線。給 agent（與人）的實作指引。

- 規格與已定案的決策：`docs/spec.md`
- 架構沿用 `../huddle`（同一個 org）：Hono、Drizzle、Discord 登入的寫法都從那裡搬過來

## Repo 結構

```
apps/web          Vue 3 SPA（Vite、Tailwind v4、Pinia、TanStack Query）
apps/server       Hono API（Node 24 直接執行 .ts，不另外 build）、Drizzle schema 與 migration
packages/shared   zod schema（API 協定）、型別、常數；web 與 server 都 import
docs/             規格
compose.yaml      本機 Postgres 17（對外 port 5434）
```

- server 以 Node 24 的 type stripping 直接執行 TypeScript：只能用可擦除的語法（不能用 `enum`、`namespace`、constructor 參數屬性），相對路徑 import 要寫 `.ts` 副檔名。
- web 透過 `hc<ApiType>('/api')`（Hono RPC）取得 API 型別，`ApiType` 從 `@bg-tracker/server` 匯出（只 import 型別）。

## 常用指令

| 指令 | 用途 |
| --- | --- |
| `nvm use` | 切到 `.nvmrc` 的 Node 24 |
| `pnpm install` | 安裝依賴（pnpm 版本由 `packageManager` 固定，用 corepack） |
| `docker compose up -d --wait` | 啟動本機 Postgres（`bg_tracker` 開發用、`bg_tracker_test` 測試用） |
| `pnpm db:migrate` / `pnpm db:seed` | 套用 migration／放入範例遊戲與機制 |
| `pnpm dev` | 同時啟動 server（`:3180`，watch）與 Vite（`:5180`，HMR）；開 http://localhost:5180 |
| `pnpm build` / `pnpm start` | build web 後，以單一 Node 程序提供 SPA 與 API |
| `pnpm typecheck` / `pnpm lint` / `pnpm test` | 三項都要通過才 commit |
| `pnpm format` | Prettier 格式化 |

第一次設定：`cp .env.example .env`（server 啟動時讀根目錄的 `.env`）。Discord 應用程式的 Redirect 要登記 `http://localhost:5180/auth/discord/callback`。

## 新增 REST endpoint

1. 在 `packages/shared` 定義 request／response 的 zod schema 與型別。
2. 在 `apps/server/src/` 對應模組寫 route，用 method chaining 掛到 `app.ts` 的 API router（型別才會傳到 `ApiType`）。
3. 掛上權限 middleware；body 用 `validate('json', schema)`。
   - 所有 `/api/*` 都已經過 `loadSession`（讀 cookie、寫入請求檢查 Origin），route 只要再掛需要的檢查：`requireAuth`、`requireSystemRole('admin')`。
   - 整個網站都要登入：資料 route 一律掛 `requireAuth`，只有 `/api/health`、`/api/config` 與登入流程公開。掛在 API 根路徑的 router 不能用 `.use('*', requireAuth)`（會連公開的 route 一起擋），要掛在每個 route 上。
   - route 內用 `currentUser(c)` 取得目前使用者；角色每個請求從 DB 讀，不要快取。
4. 寫 server 測試（Vitest + 真的 Postgres）：`useTestDb()`、`createTestDeps({ db })`、`createTestUser(db)`、`loginAs(db, user)`。
5. 前端用 `api.<路徑>.$get()` 等呼叫，型別自動帶入。

## 改 schema

1. 改 `apps/server/src/db/schema/*.ts`（列舉用 `text` + `CHECK`，見 `columns.ts` 的 `inList`；時間用 `tstz`；外鍵 `onDelete: 'restrict'`）。
2. `pnpm --filter @bg-tracker/server exec drizzle-kit generate --name <名稱>` 產生 migration，連同 schema 一起 commit。
3. 本機 `pnpm db:migrate` 套用；部署時程序啟動就會自動套用。
4. `pnpm --filter @bg-tracker/server db:check`（CI 也跑）：schema 改了卻沒產生 migration 時失敗。

**Expand / contract**：每個 migration 都要讓上一版程式碼還能跑（回滾時會發生）。不要在同一個 migration 裡刪除或改名欄位，也不要把既有欄位改成 `NOT NULL` 而沒有預設值。

## 設定、錯誤與 log

- **環境變數**：只在 `apps/server/src/config.ts` 讀（lint 會擋其他地方讀 `process.env`），同時加進 `.env.example`。前端需要的公開值放進 `GET /api/config`，不能放機密。
- **錯誤**：業務錯誤 `throw new AppError(code, status, message?)`；格式都是 `{ error: { code, message, requestId, details? } }`。
- **Log**：route 內用 `c.get('log')`（已帶 `requestId`）。不能記錄 token、cookie、OAuth code。

## 部署

正式站 https://bg-tracker.miao-bao.cc 。推到 `main` → CI 檢查 → `lathyrus-odoratus/dokploy-deploy` build 映像檔推到 `ghcr.io/lathyrus-odoratus/bg-tracker` → 打 Dokploy webhook（repo secret `DOKPLOY_WEBHOOK`）。
Dokploy 依映像檔的 `HEALTHCHECK` 判斷新版是否健康，不健康就不切流量並回滾；CI 綠燈不代表部署成功，結果看 `/api/health` 的 commit。
服務、Postgres 與每日備份由 `~/side/personal/hobby-infra/vm/services/draft/create-bg-tracker.sh` 建立，Discord 與 admin 的 env 用同目錄的 `set-bg-tracker-env.sh` 從 stdin 設定。
更新是 start-first（新舊版短暫同時跑），所以 migration 一定要照上面的 expand / contract。
