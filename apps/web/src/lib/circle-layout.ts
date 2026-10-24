import { curveBundle, line } from 'd3-shape'
import type { Graph } from '@bg-tracker/shared'

export type NodeKind = 'game' | 'mechanism'

export interface LayoutNode {
  kind: NodeKind
  id: string
  name: string
  /** 角度（弧度），0 在正上方、順時針 */
  angle: number
  x: number
  y: number
}

export interface LayoutLink {
  gameId: string
  mechanismId: string
  path: string
}

export interface CircleLayout {
  nodes: LayoutNode[]
  links: LayoutLink[]
}

/** 兩個半圈之間（正上方與正下方）留的空隙，避免頭尾的標籤擠在一起 */
const GAP = 0.12
/** 連線往圓心彎的程度：1 會穿過圓心，0 是直線 */
const BUNDLE_BETA = 0.75

/** 遊戲排右半圈、機制排左半圈，依名稱排序；不做階層 */
export function circleLayout(graph: Graph, radius: number): CircleLayout {
  const place = (kind: NodeKind, items: Graph['games'], start: number): LayoutNode[] => {
    const span = Math.PI - 2 * GAP
    const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name, 'zh-Hant'))
    return sorted.map((item, i) => {
      const angle = start + GAP + ((i + 0.5) * span) / sorted.length
      return {
        kind,
        id: item.id,
        name: item.name,
        angle,
        x: radius * Math.sin(angle),
        y: -radius * Math.cos(angle),
      }
    })
  }
  const nodes = [...place('game', graph.games, 0), ...place('mechanism', graph.mechanisms, Math.PI)]

  const byKey = new Map(nodes.map((n) => [`${n.kind}:${n.id}`, n]))
  const curve = line().curve(curveBundle.beta(BUNDLE_BETA))
  const links: LayoutLink[] = []
  for (const link of graph.links) {
    const game = byKey.get(`game:${link.gameId}`)
    const mechanism = byKey.get(`mechanism:${link.mechanismId}`)
    if (!game || !mechanism) continue
    const path = curve([
      [game.x, game.y],
      [0, 0],
      [mechanism.x, mechanism.y],
    ])
    if (path) links.push({ ...link, path })
  }
  return { nodes, links }
}

/** 標籤沿半徑朝外；左半圈翻轉 180° 讓文字保持正向 */
export function labelTransform(node: LayoutNode, radius: number, offset: number) {
  const deg = (node.angle * 180) / Math.PI - 90
  const flip = node.angle > Math.PI
  return {
    transform: `rotate(${deg}) translate(${radius + offset},0)${flip ? ' rotate(180)' : ''}`,
    anchor: flip ? 'end' : 'start',
  } as const
}

/** 和某個節點直接相連的節點（含自己），用來點亮 */
export function connectedKeys(graph: Graph, kind: NodeKind, id: string): Set<string> {
  const keys = new Set([`${kind}:${id}`])
  for (const link of graph.links) {
    if (kind === 'game' && link.gameId === id) keys.add(`mechanism:${link.mechanismId}`)
    if (kind === 'mechanism' && link.mechanismId === id) keys.add(`game:${link.gameId}`)
  }
  return keys
}
