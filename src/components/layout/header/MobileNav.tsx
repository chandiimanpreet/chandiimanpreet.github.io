import { Menu, X } from 'lucide-react'
import { useId, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import type { NavItem } from '@/types/content'

import { NavLink } from './NavLink'

export interface MobileNavProps {
  items: NavItem[]
  /** Id of the section in view; its link gets aria-current. */
  current: string | null
}

/**
 * Below md: a right-hand native modal <dialog> (focus trap, Esc, inert page from the browser; no
 * injected <style>, so the CSP stays strict). Closing returns focus to the trigger, except after
 * choosing a link: then focus is left alone so the next Tab continues from the target section.
 */
export function MobileNav({ items, current }: MobileNavProps) {
  const id = useId()
  const dialog = useRef<HTMLDialogElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const navigated = useRef(false)
  const [open, setOpen] = useState(false)

  const close = () => dialog.current?.close()

  return (
    <>
      <Button
        ref={trigger}
        variant="ghost"
        size="icon"
        className="size-target md:hidden"
        aria-label="Menu"
        aria-expanded={open}
        aria-controls={`${id}-dialog`}
        onClick={() => {
          dialog.current?.showModal()
          setOpen(true)
        }}
      >
        <Menu aria-hidden className="size-5" />
      </Button>
      {/* Clicks that land on the <dialog> itself (not the full-size panel inside) hit the backdrop. */}
      <dialog
        ref={dialog}
        id={`${id}-dialog`}
        aria-labelledby={`${id}-title`}
        onClick={(e) => e.target === e.currentTarget && close()}
        onClose={() => {
          setOpen(false)
          if (!navigated.current) trigger.current?.focus()
          navigated.current = false
        }}
        className="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-none w-3/4 max-w-sm translate-x-full border-0 border-l bg-card p-0 text-card-foreground opacity-0 transition-[translate,opacity,display,overlay] transition-discrete duration-240 ease-out backdrop:bg-background/80 backdrop:opacity-0 backdrop:transition-[opacity,display,overlay] backdrop:transition-discrete backdrop:duration-240 open:translate-x-0 open:opacity-100 open:backdrop:opacity-100 motion-reduce:transition-none motion-reduce:backdrop:transition-none starting:open:translate-x-full starting:open:opacity-0 starting:open:backdrop:opacity-0"
      >
        <div className="h-full">
          <div className="flex h-header items-center justify-between px-gutter">
            <h2 id={`${id}-title`} className="font-display text-lg">
              Menu
            </h2>
            <Button
              variant="ghost"
              size="icon"
              className="size-target"
              aria-label="Close menu"
              onClick={close}
            >
              <X aria-hidden className="size-5" />
            </Button>
          </div>
          <nav aria-label="Primary" className="px-gutter">
            <ul>
              {items.map((item) => (
                <li key={item.id}>
                  <NavLink
                    item={item}
                    active={item.id === current}
                    onClick={() => {
                      navigated.current = true
                      close()
                      // close() restores focus to the trigger natively; drop it before the jump.
                      trigger.current?.blur()
                    }}
                    className="rounded-md px-3 text-base underline-offset-6 hover:bg-accent"
                  />
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </dialog>
    </>
  )
}
