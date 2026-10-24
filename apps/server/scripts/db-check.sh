#!/usr/bin/env bash
# schema 改了卻沒有產生 migration 時失敗（CI 用）。
# drizzle-kit 沒有「只檢查」的模式：有差異時 generate 會寫出新檔，所以失敗後要刪掉它。
set -euo pipefail
cd "$(dirname "$0")/.."
out="$(pnpm exec drizzle-kit generate 2>&1)"
if grep -q 'No schema changes' <<<"$out"; then
  echo "schema 與 migration 一致"
else
  echo "$out"
  echo "schema 有變動但沒有對應的 migration：請執行 pnpm db:generate 並 commit" >&2
  exit 1
fi
