import { act, render } from '@testing-library/react'
import { createRef } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { Frame, FrameHandle, LogLine } from './contracts'
import { SystemDiagram } from './SystemDiagram'
import { TraceLog } from './TraceLog'

// A fixture frame built from the contracts, so these tests do not depend on the simulation's timings
// (sim.test.ts pins those, including the still frame's story).
const LOG: LogLine[] = [
  {
    key: 'a',
    traceId: '9e37',
    text: 'GET /v1/jobs/100 200 cache miss 17 ms',
    status: '200',
    tone: 'info',
  },
  { key: 'b', traceId: '3c6e', text: 'job.process attempt 1 failed, retrying', tone: 'failed' },
]
const FIXTURE: Frame = {
  packets: [
    { key: 'p1', from: 'workflow', to: 'agent', progress: 0.5, kind: 'retry' },
    { key: 'p2', from: 'api', to: 'auth', progress: 0.2, kind: 'response' },
  ],
  nodes: {
    client: 'idle',
    gateway: 'idle',
    auth: 'idle',
    api: 'active',
    cache: 'idle',
    db: 'idle',
    queue: 'idle',
    worker: 'idle',
    workflow: 'active',
    agent: 'idle',
  },
  tags: { workflow: 'attempt 2' },
  edges: ['workflow-agent', 'api-auth'],
  log: LOG,
}

vi.mock('./sim', () => ({ STILL_T_MS: 10300, frameAt: () => FIXTURE }))

function mockWide(matches: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  )
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('SystemDiagram', () => {
  it.each([
    [true, '0 0 640 400'],
    [false, '0 0 328 392'],
  ])('renders 10 nodes and 10 edges (wide: %s)', (wide, viewBox) => {
    mockWide(wide)
    const { container } = render(<SystemDiagram ref={createRef()} still={false} />)
    expect(container.querySelector('svg')?.getAttribute('viewBox')).toBe(viewBox)
    expect(container.querySelectorAll('[data-node]')).toHaveLength(10)
    expect(container.querySelectorAll('[data-edge]')).toHaveLength(10)
  })

  it('is aria-hidden and contains nothing focusable', () => {
    const { container } = render(<SystemDiagram ref={createRef()} still={false} />)
    expect(container.firstElementChild?.getAttribute('aria-hidden')).toBe('true')
    expect(
      container.querySelectorAll('a, button, input, select, textarea, [tabindex]'),
    ).toHaveLength(0)
  })

  it('draws the still frame on mount without a frame() call', () => {
    const { container } = render(<SystemDiagram ref={createRef()} still />)
    expect(container.querySelector('[data-node="workflow"]')?.getAttribute('data-state')).toBe(
      'active',
    )
    expect(container.querySelector('[data-node="workflow"] [data-tag]')?.textContent).toBe(
      'attempt 2',
    )
    expect(container.querySelector('[data-edge="auth-api"]')?.hasAttribute('data-active')).toBe(
      true,
    )
    expect(
      container.querySelector('[data-edge="workflow-agent"]')?.hasAttribute('data-retry'),
    ).toBe(true)
    const shown = [...container.querySelectorAll('[data-packet]')].filter(
      (g) => !g.hasAttribute('display'),
    )
    expect(shown.map((g) => g.getAttribute('data-kind'))).toEqual(['retry', 'response'])
    expect(container.querySelectorAll('li')).toHaveLength(2)
  })

  it('does no DOM writes when the same frame is drawn twice', () => {
    const ref = createRef<FrameHandle>()
    render(<SystemDiagram ref={ref} still={false} />)
    act(() => ref.current?.frame(1000, 16))
    const set = vi.spyOn(Element.prototype, 'setAttribute')
    const remove = vi.spyOn(Element.prototype, 'removeAttribute')
    act(() => ref.current?.frame(1000, 16))
    expect(set).not.toHaveBeenCalled()
    expect(remove).not.toHaveBeenCalled()
  })
})

describe('TraceLog', () => {
  it('shows at most max lines, newest last', () => {
    const lines = [1, 2, 3, 4].map((n) => ({ ...LOG[0]!, key: String(n), traceId: `000${n}` }))
    const { container } = render(<TraceLog lines={lines} max={2} />)
    const items = [...container.querySelectorAll('li')]
    expect(items).toHaveLength(2)
    expect(items.at(-1)?.textContent).toContain('0004')
  })
})
