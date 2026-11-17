import type { DateRange, EducationEntry } from '@/types/content'

export interface EducationListProps {
  entries: EducationEntry[]
}

// DESIGN-V2 5.2 shows years only ("2022 to 2025"); months add noise in a narrow aside.
const years = ({ start, end }: DateRange) =>
  `${start.slice(0, 4)} to ${end ? end.slice(0, 4) : 'present'}`

export function EducationList({ entries }: EducationListProps) {
  return (
    <dl className="divide-y divide-border">
      {entries.map((e) => (
        <div key={e.id} className="py-3">
          <dt className="font-medium text-foreground">{e.degree}</dt>
          <dd className="text-muted-foreground">{e.institution}</dd>
          <dd className="mt-1 font-mono text-code text-muted-foreground">
            {years(e.period)} · {e.grade}
          </dd>
        </div>
      ))}
    </dl>
  )
}
