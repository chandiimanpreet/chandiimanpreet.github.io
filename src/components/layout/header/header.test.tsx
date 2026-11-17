import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { SiteHeader } from '../SiteHeader'
import { ThemeToggle } from '../ThemeToggle'
import { ActiveSectionContext } from '../useActiveSection'

import { MobileNav } from './MobileNav'

describe('SiteHeader', () => {
  const currentLinks = () =>
    screen.getAllByRole('navigation', { name: 'Primary' })[0]!.querySelectorAll('[aria-current]')

  it('marks the active section link as current, and none over the hero', () => {
    const { rerender } = render(
      <ActiveSectionContext value="hero">
        <SiteHeader />
      </ActiveSectionContext>,
    )
    expect(currentLinks()).toHaveLength(0)

    rerender(
      <ActiveSectionContext value="about">
        <SiteHeader />
      </ActiveSectionContext>,
    )
    const current = currentLinks()
    expect(current).toHaveLength(1)
    expect(current[0]!.textContent).toBe('About')
    expect(current[0]!.getAttribute('aria-current')).toBe('location')
  })

  it('names the monogram link with its visible text first', () => {
    render(<SiteHeader />)
    expect(screen.getByRole('link', { name: /^MS, .+, back to top$/ })).toBeTruthy()
  })
})

describe('MobileNav', () => {
  const items = [{ id: 'about' as const, label: 'About', inNav: true }]

  const openMenu = () => {
    const trigger = screen.getByRole('button', { name: 'Menu' })
    trigger.focus()
    fireEvent.click(trigger)
    const dialog = screen.getByRole('dialog', { name: 'Menu' }) as HTMLDialogElement
    expect(dialog.open).toBe(true)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(trigger.getAttribute('aria-controls')).toBe(dialog.id)
    return { trigger, dialog }
  }

  it('opens a dialog, closes on link click and leaves focus for the target section', () => {
    render(<MobileNav items={items} current="about" />)
    const { trigger, dialog } = openMenu()
    const link = screen.getByRole('link', { name: 'About' })
    expect(link.getAttribute('aria-current')).toBe('location')

    fireEvent.click(link)
    expect(dialog.open).toBe(false)
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).not.toBe(trigger)
  })

  it('mirrors the active section with aria-current', () => {
    const { rerender } = render(<MobileNav items={items} current={null} />)
    openMenu()
    expect(screen.getByRole('link', { name: 'About' }).getAttribute('aria-current')).toBeNull()
    rerender(<MobileNav items={items} current="about" />)
    expect(screen.getByRole('link', { name: 'About' }).getAttribute('aria-current')).toBe(
      'location',
    )
  })

  it('returns focus to its trigger when closed without navigating', () => {
    render(<MobileNav items={items} current={null} />)
    const { trigger, dialog } = openMenu()
    fireEvent.click(screen.getByRole('button', { name: 'Close menu' }))
    expect(dialog.open).toBe(false)
    expect(document.activeElement).toBe(trigger)
  })

  it('closes on a backdrop click but not on a click inside the panel', () => {
    render(<MobileNav items={items} current={null} />)
    const { dialog } = openMenu()
    fireEvent.click(screen.getByRole('heading', { name: 'Menu' }))
    expect(dialog.open).toBe(true)
    fireEvent.click(dialog)
    expect(dialog.open).toBe(false)
  })
})

describe('ThemeToggle', () => {
  afterEach(() => document.documentElement.classList.remove('dark'))

  it('keeps one name and reports the theme through aria-pressed', () => {
    document.documentElement.classList.add('dark')
    render(<ThemeToggle />)
    const button = screen.getByRole('button', { name: 'Dark theme' })
    expect(button.getAttribute('aria-pressed')).toBe('true')

    fireEvent.click(button)
    expect(button.getAttribute('aria-pressed')).toBe('false')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
