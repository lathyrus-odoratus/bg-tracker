import { describe, expect, it } from 'vitest'
import { circleLayout, connectedKeys, labelTransform } from '../src/lib/circle-layout.ts'

const graph = {
  games: [
    { id: 'g1', name: '農家樂' },
    { id: 'g2', name: '卡卡頌' },
  ],
  mechanisms: [
    { id: 'm1', name: '工人放置' },
    { id: 'm2', name: '板塊拼放' },
  ],
  links: [
    { gameId: 'g1', mechanismId: 'm1' },
    { gameId: 'g2', mechanismId: 'm2' },
    { gameId: 'missing', mechanismId: 'm1' },
  ],
}

describe('circleLayout', () => {
  const { nodes, links } = circleLayout(graph, 100)

  it('遊戲在右半圈、機制在左半圈，都在圓周上', () => {
    for (const n of nodes) {
      expect(Math.hypot(n.x, n.y)).toBeCloseTo(100)
      if (n.kind === 'game') expect(n.x).toBeGreaterThan(0)
      else expect(n.x).toBeLessThan(0)
    }
  })

  it('略過指向不存在節點的連線', () => {
    expect(links.map((l) => l.gameId)).toEqual(['g1', 'g2'])
    expect(links[0]?.path).toMatch(/^M/)
  })

  it('左半圈的標籤翻轉並靠右對齊', () => {
    const game = nodes.find((n) => n.kind === 'game')!
    const mechanism = nodes.find((n) => n.kind === 'mechanism')!
    expect(labelTransform(game, 100, 8).anchor).toBe('start')
    expect(labelTransform(mechanism, 100, 8)).toMatchObject({ anchor: 'end' })
    expect(labelTransform(mechanism, 100, 8).transform).toMatch(/rotate\(180\)$/)
  })
})

describe('connectedKeys', () => {
  it('遊戲點亮它的機制；機制點亮用它的遊戲', () => {
    expect(connectedKeys(graph, 'game', 'g1')).toEqual(new Set(['game:g1', 'mechanism:m1']))
    expect(connectedKeys(graph, 'mechanism', 'm1')).toEqual(
      new Set(['mechanism:m1', 'game:g1', 'game:missing']),
    )
  })
})
