import { describe, expect, it } from 'vitest'

import { finishedRun, idleRun, reduce } from '@/components/pipeline/trace'

import { announcement, failedAttempts, formatReplayClock, runLabel } from './traceView'

describe('traceView', () => {
  it('formats the replay clock as mm:ss.t', () => {
    expect(formatReplayClock(0)).toBe('00:00.0')
    expect(formatReplayClock(3200)).toBe('00:03.2')
    expect(formatReplayClock(1049)).toBe('00:01.0')
    expect(formatReplayClock(61_500)).toBe('01:01.5')
    expect(formatReplayClock(-5)).toBe('00:00.0')
  })

  it('labels the run button by status', () => {
    expect(runLabel('done', false)).toBe('Run trace')
    expect(runLabel('done', true)).toBe('Run again')
    expect(runLabel('running', true)).toBe('Pause')
    expect(runLabel('paused', true)).toBe('Resume')
    expect(runLabel('idle', true)).toBe('Run trace')
  })

  it('counts failed attempts per step', () => {
    const retry = finishedRun('retry').spans
    expect(failedAttempts(retry, 'resume')).toBe(1)
    expect(failedAttempts(retry, 'jd')).toBe(0)
    expect(failedAttempts(finishedRun('clean').spans, 'resume')).toBe(0)
    expect(failedAttempts(idleRun('retry').spans, 'resume')).toBe(0)
  })

  it('announces every event that landed since the last render, or only the newest after a reset', () => {
    const at3100 = reduce(idleRun('retry'), 3100)
    const before = at3100.log
    const after = reduce(at3100, 3200).log
    // resume completes and three evaluators start, all at 3200ms
    expect(announcement(before, after).split('. ').length).toBe(4)
    expect(announcement(before, after)).toMatch(
      /^Resume parsing completed\. Skill evaluator started\./,
    )
    const finished = finishedRun('clean').log
    expect(announcement(before, finished)).toBe('Recommendation ready. Workflow completed.')
    expect(announcement(finished, finished)).toBe('Recommendation ready. Workflow completed.')
  })
})
