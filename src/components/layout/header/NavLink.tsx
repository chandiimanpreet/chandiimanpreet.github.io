import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'
import type { NavItem } from '@/types/content'

export interface NavLinkProps extends Omit<ComponentProps<'a'>, 'href' | 'children'> {
  item: NavItem
  /** The section in view: sets aria-current and the filled chip. */
  active: boolean
}

/** One primary-nav anchor: the anchor is the 44px target, the inner span the visible 32px chip. */
export function NavLink({ item, active, className, ...rest }: NavLinkProps) {
  return (
    <a
      {...rest}
      href={`#${item.id}`}
      aria-current={active ? 'location' : undefined}
      className={cn('group flex h-target items-center outline-none', className)}
    >
      <span
        className={cn(
          'flex h-8 items-center whitespace-nowrap rounded-sm px-2 font-mono text-xs font-medium transition-colors duration-120 md:px-2.5 md:text-sm',
          'group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-ring',
          active
            ? 'bg-secondary text-foreground ring-1 ring-border ring-inset'
            : 'text-muted-foreground group-hover:bg-secondary/60 group-hover:text-foreground',
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'mr-px transition-colors duration-120',
            active ? 'text-primary' : 'text-border-strong group-hover:text-primary',
          )}
        >
          /
        </span>
        {item.label.toLowerCase()}
      </span>
    </a>
  )
}
