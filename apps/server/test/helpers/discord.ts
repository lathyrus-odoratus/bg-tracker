import { AppError } from '../../src/errors.ts'
import type { DiscordClient, DiscordProfile } from '../../src/discord/client.ts'

/**
 * 假的 Discord API。`codes` 對應授權碼 → 使用者資料；
 * 沒登記的授權碼視為無效（401），`down = true` 時模擬 Discord 5xx（502）。
 */
export class FakeDiscord implements DiscordClient {
  readonly codes = new Map<string, DiscordProfile>()
  down = false
  lastRedirectUri: string | undefined

  addCode(code: string, profile: Partial<DiscordProfile> & { id: string }) {
    this.codes.set(code, {
      username: `u${profile.id}`,
      global_name: null,
      avatar: null,
      ...profile,
    })
  }

  async exchangeCode(code: string, redirectUri: string) {
    this.lastRedirectUri = redirectUri
    if (this.down) throw new AppError('discord_unavailable', 502)
    if (!this.codes.has(code)) throw new AppError('discord_auth_failed', 401)
    return `token:${code}`
  }

  async getCurrentUser(accessToken: string) {
    if (this.down) throw new AppError('discord_unavailable', 502)
    const profile = this.codes.get(accessToken.replace(/^token:/, ''))
    if (!profile) throw new AppError('discord_auth_failed', 401)
    return profile
  }
}
