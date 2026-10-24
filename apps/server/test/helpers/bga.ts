import { AppError } from '../../src/errors.ts'
import type { BgaClient, BgaGame } from '../../src/bga/catalog.ts'

/** 假的 BGA：`games` 裡有的代號才找得到，`down = true` 時模擬 BGA 連不上（502） */
export class FakeBga implements BgaClient {
  readonly games = new Map<string, BgaGame>()
  down = false

  add(game: Partial<BgaGame> & { slug: string }) {
    this.games.set(game.slug, {
      nameEn: game.slug,
      nameZh: null,
      minPlayers: null,
      maxPlayers: null,
      bggId: null,
      imageUrl: null,
      ...game,
    })
  }

  async lookup(slug: string) {
    if (this.down) throw new AppError('bga_unavailable', 502)
    return this.games.get(slug) ?? null
  }
}
