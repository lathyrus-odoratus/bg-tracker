import { AppError } from '../../src/errors.ts'
import type { BgaCatalog, BgaClient, BgaGame, BgaTag } from '../../src/bga/catalog.ts'

/**
 * 假的 BGA：`games` 裡有的代號才找得到，`down = true` 時模擬 BGA 連不上（502）。
 * 全站標籤是 `mechanisms`／`themes` 加上各遊戲用到的
 */
export class FakeBga implements BgaClient {
  readonly games = new Map<string, BgaGame>()
  mechanisms: BgaTag[] = []
  themes: BgaTag[] = []
  down = false

  add(game: Partial<BgaGame> & { slug: string }) {
    this.games.set(game.slug, {
      nameEn: game.slug,
      nameZh: null,
      minPlayers: null,
      maxPlayers: null,
      bggId: null,
      imageUrl: null,
      mechanisms: [],
      themes: [],
      ...game,
    })
  }

  async lookup(slug: string) {
    if (this.down) throw new AppError('bga_unavailable', 502)
    return this.games.get(slug) ?? null
  }

  async catalog(): Promise<BgaCatalog> {
    if (this.down) throw new AppError('bga_unavailable', 502)
    const all = (pick: (g: BgaGame) => BgaTag[], extra: BgaTag[]) => [
      ...new Map(
        [...extra, ...[...this.games.values()].flatMap(pick)].map((t) => [t.tagId, t]),
      ).values(),
    ]
    return {
      mechanisms: all((g) => g.mechanisms, this.mechanisms),
      themes: all((g) => g.themes, this.themes),
      game: (slug) => this.games.get(slug) ?? null,
    }
  }
}
