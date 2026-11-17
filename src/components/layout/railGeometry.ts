/*
 * Rail geometry (DESIGN-V2 section 4), as Tailwind class strings. <main> is the page container with
 * a `pl-rail` column; the line sits at gutter + rail/2 from main's left edge, the same x as the
 * footer's hollow end node. Inside a <Section> (which starts after that column) the same x is
 * gutter - rail/2, so the h2 text (at the section's padding edge) is rail/2 right of the line.
 *
 * Token widths (rail-col / fork-offset / gutter): below md 20px / 0 / 5vw (18px at 360);
 * md+ 56px / 28px / 38.4px at 768, 48px from 960 up (1024, 1440 identical).
 */

/** Line x inside <main>. */
export const RAIL_X_IN_MAIN = 'left-[calc(var(--spacing-gutter)_+_var(--rail-col)/2)]'
/** Line x inside a <Section>. */
export const RAIL_X_IN_SECTION = 'left-[calc(var(--spacing-gutter)_-_var(--rail-col)/2)]'
/** Fork x: the steel bracket's outer edge, fork-offset right of the line (0 below md). */
export const FORK_X_IN_SECTION =
  'left-[calc(var(--spacing-gutter)_-_var(--rail-col)/2_+_var(--fork-offset))]'
/** Vertical centre of an h2's first line (h2 line-height 1.1): `em` resolves against text-h2. */
export const H2_LINE_Y = 'top-[calc(var(--spacing-section)_+_0.55em)] text-h2'
/** HEAD node and line start beside the hero. */
export const HEAD_Y = 'top-[calc(var(--spacing-section)_+_0.75rem)]'

/*
 * Section content padding. Below md rail/2 is only 10px, so the 8px node sat ~6px from the h2:
 * +0.5rem gives 14px. The fork variant also indents by fork-offset at md+, so its node (centred
 * on the bracket edge at x = gutter, 6px radius) ends 22px before the h2 and the bracket's arm
 * and vertical edge stay in the gutter instead of touching the heading and content.
 * HeroSection and SiteFooter use SECTION_PL too, so every block's text shares one left edge.
 */
const PL_BELOW_MD = 'pl-[calc(var(--spacing-gutter)_+_0.5rem)]'
export const SECTION_PL = `${PL_BELOW_MD} md:pl-gutter`
export const FORK_SECTION_PL = `${PL_BELOW_MD} md:pl-[calc(var(--spacing-gutter)_+_var(--fork-offset))]`
