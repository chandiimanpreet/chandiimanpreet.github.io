import { linkClass } from '@/lib/styles'

import { skillKey, type SkillLink } from './skillLayers'

export interface SkillGroupProps {
  label: string
  items: string[]
  links: Map<string, SkillLink>
}

/** One labelled line of the skills list: label, then the skills as running text. */
export function SkillGroup({ label, items, links }: SkillGroupProps) {
  return (
    <div className="py-4 md:flex md:gap-6">
      <dt className="font-semibold text-foreground md:w-label md:shrink-0">{label}</dt>
      <dd className="mt-1 md:mt-0">
        <ul className="flex flex-wrap text-muted-foreground">
          {items.map((item, i) => {
            const link = links.get(skillKey(item))
            return (
              <li key={item}>
                {link ? (
                  <a href={link.href} title={link.title} className={linkClass}>
                    {item}
                  </a>
                ) : (
                  item
                )}
                {/* Separator trails its item inside the same <li>, so a wrapped line never starts with a dot. */}
                {i < items.length - 1 && (
                  <span aria-hidden="true" className="px-2">
                    ·
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      </dd>
    </div>
  )
}
