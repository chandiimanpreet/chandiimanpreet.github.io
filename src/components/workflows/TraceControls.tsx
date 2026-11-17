import { Check, Pause, Play, RotateCcw, SkipForward } from 'lucide-react'

import { SCENARIOS, type RunState, type ScenarioId } from '@/components/pipeline/trace'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { formatReplayClock, runLabel } from './traceView'

export interface TraceControlsProps {
  run: RunState
  /** The visitor has started or stepped a run since the last reset. */
  touched: boolean
  /** Reduced motion: no playback, Step walks the run one event at a time. */
  reducedMotion: boolean
  onScenario(s: ScenarioId): void
  onRun(): void
  onPause(): void
  onStep(): void
  onReset(): void
}

const TOUCH = 'h-target px-4'
// Below sm the playback buttons share one row: equal widths, tighter padding, no wrapping.
const PLAYBACK = 'h-target min-w-0 flex-1 px-2 sm:flex-none sm:px-4'

/** Scenario switch, Run/Pause/Step/Reset and the replay readout. */
export function TraceControls({
  run,
  touched,
  reducedMotion,
  onScenario,
  onRun,
  onPause,
  onStep,
  onReset,
}: TraceControlsProps) {
  const { events, totalMs } = SCENARIOS[run.scenario]
  const running = run.status === 'running'

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div role="group" aria-label="Scenario" className="flex w-full gap-2 sm:w-auto">
          {Object.values(SCENARIOS).map((s) => {
            const pressed = run.scenario === s.id
            return (
              <Button
                key={s.id}
                variant="outline"
                aria-pressed={pressed}
                onClick={() => onScenario(s.id)}
                // The outline variant sets dark:bg-input/30, so the pressed fill is restated for
                // dark. Fill, border, weight and the check mark: never colour alone.
                className={cn(
                  TOUCH,
                  'flex-1 sm:flex-none',
                  'aria-pressed:border-primary aria-pressed:bg-secondary aria-pressed:font-semibold',
                  'dark:aria-pressed:border-primary dark:aria-pressed:bg-secondary',
                )}
              >
                {pressed && <Check aria-hidden />}
                {s.label}
              </Button>
            )
          })}
        </div>
        <div className="flex w-full flex-nowrap gap-2 sm:w-auto">
          {!reducedMotion && (
            <Button onClick={running ? onPause : onRun} className={PLAYBACK}>
              {running ? <Pause aria-hidden /> : <Play aria-hidden />}
              {runLabel(run.status, touched)}
            </Button>
          )}
          <Button variant="outline" onClick={onStep} className={PLAYBACK}>
            {/* Enabled while running: useTraceRun.step() pauses, then advances one event. */}
            <SkipForward aria-hidden />
            Step
          </Button>
          <Button variant="outline" onClick={onReset} className={PLAYBACK}>
            <RotateCcw aria-hidden />
            Reset
          </Button>
        </div>
        <p className="font-mono text-code text-muted-foreground tabular-nums lg:ml-auto">
          replay clock {formatReplayClock(run.clockMs)} · event {run.cursor} of {events.length}
        </p>
      </div>
      {/* Decorative: the readout above carries the same information as text. */}
      <div aria-hidden className="mt-3 h-0.5 overflow-hidden rounded-sm bg-secondary">
        <div
          className="h-full origin-left bg-primary"
          style={{ transform: `scaleX(${run.clockMs / totalMs})` }}
        />
      </div>
      {reducedMotion && (
        <p className="mt-3 text-sm text-muted-foreground">
          Reduced motion is on, so the run does not play. Use Step to walk it one event at a time.
        </p>
      )}
    </div>
  )
}
