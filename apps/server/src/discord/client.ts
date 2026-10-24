import { AppError } from '../errors.ts'

const API = 'https://discord.com/api/v10'

export interface DiscordProfile {
  id: string
  username: string
  global_name: string | null
  avatar: string | null
}

/** 呼叫 Discord API 的部分；測試時換成假的實作 */
export interface DiscordClient {
  exchangeCode(code: string, redirectUri: string): Promise<string>
  getCurrentUser(accessToken: string): Promise<DiscordProfile>
}

function unavailable(cause: unknown): AppError {
  return new AppError('discord_unavailable', 502, 'Discord is unavailable', undefined, cause)
}

async function call(input: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(input, { ...init, signal: AbortSignal.timeout(10_000) })
  } catch (err) {
    throw unavailable(err)
  }
}

export function createDiscordClient(clientId: string, clientSecret: string): DiscordClient {
  return {
    async exchangeCode(code, redirectUri) {
      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      })
      const res = await call(`${API}/oauth2/token`, { method: 'POST', body })
      if (res.status >= 500) throw unavailable(res.status)
      if (!res.ok) throw new AppError('discord_auth_failed', 401, 'Discord authorization failed')
      const json = (await res.json()) as { access_token: string }
      return json.access_token
    },

    async getCurrentUser(accessToken) {
      const res = await call(`${API}/users/@me`, {
        headers: { authorization: `Bearer ${accessToken}` },
      })
      if (res.status >= 500) throw unavailable(res.status)
      if (!res.ok) throw new AppError('discord_auth_failed', 401, 'Discord authorization failed')
      return (await res.json()) as DiscordProfile
    },
  }
}
