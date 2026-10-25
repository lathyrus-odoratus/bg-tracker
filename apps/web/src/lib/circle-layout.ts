import { arc, curveBundle, line } from 'd3-shape'
import type { Graph } from '@bg-tracker/shared'

/** 排版只需要 id 與要顯示的名稱（呼叫端先換成目前語言的名稱） */
export interface LayoutGraph {
  games: { id: string; name: string }[]
  mechanisms: { id: string; name: string }[]
  links: Graph['links']
}

export type NodeKind = 'game' | 'mechanism'

export interface LayoutNode {
  kind: NodeKind
  id: string
  name: string
  /** 角度（弧度），0 在正上方、順時針 */
  angle: number
  /** 這個節點分到的角度寬（同一半圈平均分），點擊區的扇形用 */
  slot: number
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

/** 遊戲排右半圈、機制排左半圈，依名稱排序（`lang` 決定排序規則）；不做階層 */
export function circleLayout(graph: LayoutGraph, radius: number, lang = 'zh-Hant'): CircleLayout {
  const place = (kind: NodeKind, items: LayoutGraph['games'], start: number): LayoutNode[] => {
    const span = Math.PI - 2 * GAP
    const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name, lang))
    const slot = span / sorted.length
    return sorted.map((item, i) => {
      const angle = start + GAP + (i + 0.5) * slot
      return {
        kind,
        id: item.id,
        name: item.name,
        angle,
        slot,
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
export function connectedKeys(
  graph: Pick<Graph, 'links'>,
  kind: NodeKind,
  id: string,
): Set<string> {
  const keys = new Set([`${kind}:${id}`])
  for (const link of graph.links) {
    if (kind === 'game' && link.gameId === id) keys.add(`mechanism:${link.mechanismId}`)
    if (kind === 'mechanism' && link.mechanismId === id) keys.add(`game:${link.gameId}`)
  }
  return keys
}

/** 點擊區的扇形：角度是節點分到的那一格，半徑從圓點內側到標籤外緣，相鄰節點剛好接上 */
export function hitAreaPath(node: LayoutNode, innerRadius: number, outerRadius: number) {
  return (
    arc()({
      innerRadius,
      outerRadius,
      startAngle: node.angle - node.slot / 2,
      endAngle: node.angle + node.slot / 2,
    }) ?? ''
  )
}
