import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { barGeometry, formatSeconds, pct } from './timeline'
import { finishedRun, idleRun, reduce, SCENARIOS } from './trace'
import { WorkflowTimeline } from './WorkflowTimeline'

describe('timeline geometry', () => {
  it('places a finished span by percent of totalMs', () => {
    expect(barGeometry(1000, 3000, 6000, 4000)).toEqual({ left: 25, width: 50 })
  })

  it('extends a running span to the clock and clamps to the track', () => {
    expect(barGeometry(1000, null, 2000, 4000)).toEqual({ left: 25, width: 25 })
    expect(barGeometry(1000, null, 500, 4000).width).toBe(0)
    expect(barGeometry(3000, 9000, 0, 4000)).toEqual({ left: 75, width: 25 })
    expect(pct(10, 0)).toBe(0)
  })

  it('formats replay seconds', () => {
    expect(formatSeconds(1900)).toBe('1.9s')
    expect(formatSeconds(0)).toBe('0.0s')
  })
})

/** The table row headed by `name`; fails the test with a clear message when there is none. */
function rowOf(name: string): HTMLTableRowElement {
  const row = screen.getByRole('rowheader', { name }).closest('tr')
  if (!row) throw new Error(`row header "${name}" is not inside a <tr>`)
  return row
}

describe('WorkflowTimeline', () => {
  const retry = finishedRun('retry')
  const totalMs = SCENARIOS.retry.totalMs

  it('is a captioned table whose cells carry the failed and retried attempts as text', () => {
    render(<WorkflowTimeline spans={retry.spans} clockMs={retry.clockMs} totalMs={totalMs} />)
    const table = screen.getByRole('table', { name: 'Workflow execution' })
    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((th) => th.textContent?.replace(/\d+s/g, '')),
    ).toEqual(['Step', 'Attempts', 'Outcome', 'Started', 'Ended'])
    const row = rowOf('Resume parsing')
    const text = row.textContent ?? ''
    expect(text).toContain('attempt 1 failed')
    expect(text).toContain('attempt 2 done')
    expect(text).toContain('0.0s')
    expect(text).toContain('3.2s')
    expect(row.querySelectorAll('[data-outcome="failed"]')).toHaveLength(1)
    // Finished: no playhead, and the note says it is a replay.
    expect(table.querySelector('[data-playhead]')).toBeNull()
    expect(screen.getByText(/Simulated replay/)).toBeTruthy()
  })

  it('shows waiting and running rows mid-run with a playhead', () => {
    const mid = reduce(idleRun('retry'), 1500)
    render(<WorkflowTimeline spans={mid.spans} clockMs={mid.clockMs} totalMs={totalMs} />)
    const rec = rowOf('Recommendation')
    expect(rec.textContent).toContain('waiting')
    expect(rec.textContent).toContain('not yet')
    expect(screen.getAllByText('done').length).toBe(1) // JD extraction only
    expect(document.querySelector('[data-playhead]')).not.toBeNull()
  })

  it('selects a step by button and marks the selected row', () => {
    const onSelect = vi.fn()
    render(
      <WorkflowTimeline
        spans={retry.spans}
        clockMs={retry.clockMs}
        totalMs={totalMs}
        selected="jd"
        onSelect={onSelect}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Skill evaluator' }))
    expect(onSelect).toHaveBeenCalledWith('skill')
    const jd = screen.getByRole('button', { name: 'JD extraction' })
    expect(jd.getAttribute('aria-pressed')).toBe('true')
    expect(jd.closest('tr')?.hasAttribute('data-selected')).toBe(true)
  })
})
