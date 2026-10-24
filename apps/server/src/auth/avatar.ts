/**
 * 從 Discord avatar hash 組出頭像網址。
 */
export function discordAvatarUrl(discordUserId: string, avatarHash: string | null) {
  if (avatarHash) {
    return `https://cdn.discordapp.com/avatars/${discordUserId}/${avatarHash}.png?size=128`
  }
  // 沒有頭像：Discord 的預設頭像（新版使用者名稱的算法）
  let index = 0
  try {
    index = Number((BigInt(discordUserId) >> 22n) % 6n)
  } catch {
    // 不是數字的 id 只會出現在測試
  }
  return `https://cdn.discordapp.com/embed/avatars/${index}.png`
}
