import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'
import type { NavItem } from '@/types/content'

export interface NavLinkProps extends Omit<ComponentProps<'a'>, 'href' | 'children'> {
  item: NavItem
  /** The section in view: sets aria-current and the underline. */
  active: boolean
}

/** One primary-nav anchor. Spreads rest props so callers can attach handlers (e.g. closing the mobile menu). */
export function NavLink({ item, active, className, ...rest }: NavLinkProps) {
  return (
    <a
      {...rest}
      href={`#${item.id}`}
      aria-current={active ? 'location' : undefined}
      className={cn(
        'flex h-target items-center font-medium text-muted-foreground transition-colors duration-120 hover:text-foreground',
        active && 'text-foreground underline decoration-primary decoration-2',
        className,
      )}
    >
      {item.label}
    </a>
  )
}
