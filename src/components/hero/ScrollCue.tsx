/** DESIGN-V3 4.7: a packet leaving the hero. Decorative, only from `xl` where the hero is one viewport. */
export function ScrollCue() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 xl:flex"
    >
      <span className="font-mono text-code text-muted-foreground">scroll</span>
      <span className="relative h-8 w-px bg-border-strong">
        <span className="absolute top-0 left-1/2 size-1 -translate-x-1/2 animate-cue rounded-full bg-primary group-data-[paused=true]/hero:[animation-play-state:paused] motion-reduce:animate-none" />
      </span>
    </div>
  )
}
