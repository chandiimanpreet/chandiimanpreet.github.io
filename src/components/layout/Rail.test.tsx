import { act, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Layout } from './Layout'
import { Section } from './Section'

type IOCallback = (entries: Partial<IntersectionObserverEntry>[]) => void

// jsdom has no IntersectionObserver. Drive useActiveSection's (the page's only one) by hand.
function mockObserver() {
  const observed: Element[] = []
  let fire: IOCallback = () => {}
  class FakeIO {
    constructor(cb: IOCallback) {
      fire = cb
    }
    observe = (el: Element) => observed.push(el)
    disconnect = vi.fn()
  }
  vi.stubGlobal('IntersectionObserver', FakeIO)
  return { observed, fire: (entries: Partial<IntersectionObserverEntry>[]) => fire(entries) }
}

const node = (c: HTMLElement, id: string) =>
  c.querySelector(`#${id} > [data-rail-node]`)?.getAttribute('data-active')

describe('rail', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('keeps sections as direct children of main and fills the active node', () => {
    const io = mockObserver()
    const { container } = render(
      <Layout>
        <Section id="about" title="About" />
        <Section id="contact" title="Contact" />
      </Layout>,
    )
    const main = container.querySelector('main')
    expect([...main!.querySelectorAll(':scope > section')].map((s) => s.id)).toEqual([
      'about',
      'contact',
    ])
    expect(new Set(io.observed).size).toBe(2)
    expect(node(container, 'about')).toBe('false')

    act(() => io.fire([{ target: main!.querySelector('#contact')!, isIntersecting: true }]))
    expect(node(container, 'contact')).toBe('true')
    expect(node(container, 'about')).toBe('false')

    // Leaving the band without entering another keeps the last active section.
    act(() => io.fire([{ target: main!.querySelector('#contact')!, isIntersecting: false }]))
    expect(node(container, 'contact')).toBe('true')
  })

  it('renders aside beside the h2 and the steel fork only for variant fork', () => {
    const { container, getByRole, getByText } = render(
      <>
        <Section id="skills" title="Skills" />
        <Section
          id="showcase"
          title="Engineers"
          variant="fork"
          aside={<span>branch: people</span>}
        />
      </>,
    )
    expect(getByRole('heading', { level: 2, name: 'Engineers' }).nextSibling).toBe(
      getByText('branch: people'),
    )
    expect(container.querySelector('#skills [data-fork]')).toBeNull()
    expect(container.querySelector('#showcase [data-fork]')).not.toBeNull()
    expect(container.querySelectorAll('[data-rail-node][aria-hidden="true"]')).toHaveLength(2)
  })
})
