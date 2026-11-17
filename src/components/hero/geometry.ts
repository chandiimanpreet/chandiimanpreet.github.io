import type { DiagramLayout, LayoutId, NodeId, Point } from './contracts'

const p = (x: number, y: number): Point => ({ x, y })

// Coordinates are verbatim from DESIGN-V3 section 5.3.
export const LAYOUTS: Record<LayoutId, DiagramLayout> = {
  wide: {
    viewBox: { w: 640, h: 400 },
    box: { w: 84, h: 36 },
    fontSize: 12,
    nodes: {
      client: p(28, 170),
      gateway: p(118, 170),
      auth: p(232, 170),
      api: p(346, 170),
      cache: p(346, 58),
      db: p(582, 170),
      queue: p(346, 290),
      worker: p(464, 290),
      workflow: p(582, 290),
      agent: p(582, 372),
    },
    edges: {
      'client-gateway': [p(37, 170), p(76, 170)],
      'gateway-auth': [p(160, 170), p(190, 170)],
      'auth-api': [p(274, 170), p(304, 170)],
      'api-cache': [p(346, 152), p(346, 76)],
      'api-db': [p(388, 170), p(540, 170)],
      'api-queue': [p(346, 188), p(346, 272)],
      'queue-worker': [p(388, 290), p(422, 290)],
      'worker-workflow': [p(506, 290), p(540, 290)],
      'workflow-agent': [p(582, 308), p(582, 354)],
      'workflow-db': [p(582, 272), p(582, 188)],
    },
  },
  tall: {
    viewBox: { w: 328, h: 392 },
    box: { w: 76, h: 32 },
    fontSize: 11,
    nodes: {
      client: p(36, 30),
      gateway: p(136, 30),
      auth: p(256, 30),
      api: p(256, 114),
      cache: p(136, 114),
      db: p(136, 198),
      queue: p(256, 198),
      worker: p(256, 282),
      workflow: p(136, 282),
      agent: p(136, 362),
    },
    edges: {
      'client-gateway': [p(45, 30), p(98, 30)],
      'gateway-auth': [p(174, 30), p(218, 30)],
      'auth-api': [p(256, 46), p(256, 98)],
      'api-cache': [p(218, 114), p(174, 114)],
      'api-db': [p(232, 130), p(232, 156), p(136, 156), p(136, 182)],
      'api-queue': [p(268, 130), p(268, 182)],
      'queue-worker': [p(256, 214), p(256, 266)],
      'worker-workflow': [p(218, 282), p(174, 282)],
      'workflow-agent': [p(136, 298), p(136, 346)],
      'workflow-db': [p(136, 266), p(136, 214)],
    },
  },
}

/** Point at fraction `t` (clamped to 0..1) of the polyline's total length. */
export function pointAt(points: readonly Point[], t: number): Point {
  const first = points[0]
  if (!first) return p(0, 0)
  const lengths = points.slice(1).map((b, i) => {
    const a = points[i] ?? b
    return Math.hypot(b.x - a.x, b.y - a.y)
  })
  let remaining = Math.min(Math.max(t, 0), 1) * lengths.reduce((sum, l) => sum + l, 0)
  for (let i = 0; i < lengths.length; i++) {
    const len = lengths[i] ?? 0
    const a = points[i] ?? first
    const b = points[i + 1] ?? a
    if (remaining <= len && len > 0) {
      const f = remaining / len
      return p(a.x + (b.x - a.x) * f, a.y + (b.y - a.y) * f)
    }
    remaining -= len
  }
  return points.at(-1) ?? first
}

/** Position of a packet travelling `from` -> `to`; edges are stored one way, reverse travel uses 1 - progress. */
export function pointOnEdge(
  layout: DiagramLayout,
  from: NodeId,
  to: NodeId,
  progress: number,
): Point {
  const forward = layout.edges[`${from}-${to}`]
  if (forward) return pointAt(forward, progress)
  const reverse = layout.edges[`${to}-${from}`]
  if (reverse) return pointAt(reverse, 1 - progress)
  return pointAt([layout.nodes[from], layout.nodes[to]], progress)
}
