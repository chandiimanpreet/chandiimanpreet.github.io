import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { App } from './App'
import { headingId, sections } from './content/nav'

// Contract every section file must keep: rendered in nav order, labelled by its own heading.
describe('App', () => {
  it('renders every section in order with one h1 and labelled headings', () => {
    const { container } = render(<App />)
    expect(container.querySelectorAll('h1')).toHaveLength(1)
    const rendered = [...container.querySelectorAll('main > section')].map((s) => s.id)
    expect(rendered).toEqual(sections.map((s) => s.id))
    for (const { id } of sections) {
      const section = container.querySelector(`#${id}`)
      expect(section?.getAttribute('aria-labelledby')).toBe(headingId(id))
      expect(container.querySelector(`#${headingId(id)}`)?.textContent).toBeTruthy()
    }
  })
})
