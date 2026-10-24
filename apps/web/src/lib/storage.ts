/** localStorage 在私密視窗、iframe 隔離時可能拋錯；讀寫失敗都當作沒有值 */
export function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeStorage(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // 忽略：只是偏好設定
  }
}
