import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { PersonCard } from './PersonCard'
import { toPerson } from './person'

describe('PersonCard', () => {
  it('keeps the initials under the avatar and drops the img when it fails', () => {
    const { container } = render(<PersonCard person={toPerson('antirez')!} />)
    expect(screen.getByText('A')).toBeTruthy()
    const img = container.querySelector('img')!
    expect(img.getAttribute('loading')).toBe('lazy')
    fireEvent.error(img)
    expect(container.querySelector('img')).toBeNull()
    expect(screen.getByText('A')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'antirez' })).toBeTruthy()
  })
})
