import { useEffect, useState } from 'react'

import { projectAnchorId, systemAnchorId } from '@/lib/anchors'

interface HasId {
  id: string
}

/**
 * DOM id -> accordion value. Projects answer to `project-<id>` (Skills links); systems answer to
 * `system-<id>` (Experience links) and `project-<id>` (Skills links).
 */
export function buildAnchors(projects: HasId[], systems: HasId[]): Map<string, string> {
  return new Map([
    ...projects.map((p): [string, string] => [projectAnchorId(p.id), p.id]),
    ...systems.flatMap((s): [string, string][] => [
      [systemAnchorId(s.id), s.id],
      [projectAnchorId(s.id), s.id],
    ]),
  ])
}

/** Accordion value targeted by a location hash ("#system-helm-deployer"), or null. */
export function rowForHash(hash: string, anchors: ReadonlyMap<string, string>): string | null {
  return anchors.get(hash.replace(/^#/, '')) ?? null
}

const withRow = (open: string[], row: string | null): string[] =>
  row && !open.includes(row) ? [...open, row] : open

/**
 * Controlled open rows for a `type="multiple"` accordion: the row the URL hash points at opens
 * (on load and on every hashchange) and is scrolled into view.
 */
export function useHashOpenRows(anchors: ReadonlyMap<string, string>, initial: string[]) {
  const [open, setOpen] = useState(() => withRow(initial, rowForHash(location.hash, anchors)))

  useEffect(() => {
    // ponytail: re-clicking a link whose hash is already current fires no hashchange, so a row
    // the visitor closed meanwhile stays closed; add a delegated click listener if that matters.
    const scrollToHash = () => document.getElementById(location.hash.slice(1))?.scrollIntoView()
    const onHashChange = () => {
      const row = rowForHash(location.hash, anchors)
      if (!row) return
      setOpen((prev) => withRow(prev, row))
      scrollToHash()
    }
    // The browser tried to scroll before React rendered the anchor; do it now.
    if (rowForHash(location.hash, anchors)) scrollToHash()
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [anchors])

  return [open, setOpen] as const
}
