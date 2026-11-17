export type NodeId =
  'client' | 'gateway' | 'auth' | 'api' | 'cache' | 'db' | 'queue' | 'worker' | 'workflow' | 'agent'
export type EdgeId = `${NodeId}-${NodeId}`
export type NodeState = 'idle' | 'active' | 'ok' | 'failed' | 'backoff'
export type PacketKind = 'request' | 'response' | 'event' | 'retry'
export type ScenarioId = 'cache-hit' | 'cache-miss' | 'enqueue' | 'workflow-retry'
export type LayoutId = 'wide' | 'tall'

export interface Point {
  x: number
  y: number
}

export interface DiagramLayout {
  viewBox: { w: number; h: number }
  box: { w: number; h: number }
  fontSize: number
  nodes: Record<NodeId, Point>
  /** Polyline per edge, in the direction of the id (`from-to`). Reverse travel uses 1 - progress. */
  edges: Partial<Record<EdgeId, readonly Point[]>>
}

/** One hop of one track. Times are filled in by compile(). */
export interface Hop {
  to: NodeId
  kind: PacketKind
  /** Work on arrival in ms. 0 = pass through. Defaults to the node's work time for non-response hops. */
  work?: number
  /** State the node shows while working (default 'active') and the state it flashes after. */
  result?: 'ok' | 'failed'
  /** Tag shown on the node while it works. */
  tag?: string
  /** Extra states held at the node after work, before the next hop leaves (fail hold, backoff). */
  holds?: readonly { state: NodeState; ms: number; tag?: string }[]
}
export interface Track {
  from: NodeId
  hops: readonly Hop[]
  forkFrom?: { track: number; afterHop: number }
}
export interface Scenario {
  id: ScenarioId
  tracks: readonly Track[]
}

export interface Segment {
  from: NodeId
  to: NodeId
  kind: PacketKind
  startMs: number
  endMs: number
  track: number
}
export interface Pulse {
  node: NodeId
  state: NodeState
  startMs: number
  endMs: number
  tag?: string
}
export interface LogEvent {
  atMs: number
  kind: 'response' | 'failed' | 'completed'
}
export interface Timeline {
  durationMs: number
  segments: readonly Segment[]
  pulses: readonly Pulse[]
  events: readonly LogEvent[]
}

export interface PacketFrame {
  key: string
  from: NodeId
  to: NodeId
  progress: number
  kind: PacketKind
}
export interface LogLine {
  key: string
  traceId: string
  text: string
  status?: string
  tone: 'info' | 'ok' | 'failed'
}
export interface Frame {
  packets: readonly PacketFrame[]
  nodes: Record<NodeId, NodeState>
  tags: Partial<Record<NodeId, string>>
  /** Edges that currently carry a packet. */
  edges: readonly EdgeId[]
  /** Oldest first; at most 3. */
  log: readonly LogLine[]
}

/** What the frame loop drives. Implemented by BinaryRain and SystemDiagram via useImperativeHandle. */
export interface FrameHandle {
  frame(tMs: number, dtMs: number): void
}
