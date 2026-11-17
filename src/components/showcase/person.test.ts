import { describe, expect, it } from 'vitest'

import { avatarUrl, initials, spotlightPosition, toPerson } from './person'

describe('avatarUrl', () => {
  it('derives a static avatar on the allowlisted host', () => {
    expect(avatarUrl('mitchellh')).toBe('https://avatars.githubusercontent.com/mitchellh?s=96')
  })

  it.each(['../evil', 'a/b', '', '-lead', 'x'.repeat(40), 'evil.com', 'a?b'])(
    'rejects invalid login %j',
    (login) => expect(avatarUrl(login)).toBeNull(),
  )
})

describe('toPerson', () => {
  it('accepts a bare login and leaves the reason for a <Todo>', () => {
    expect(toPerson('antirez')).toEqual({
      login: 'antirez',
      name: null,
      reason: null,
      profileUrl: 'https://github.com/antirez',
      avatarUrl: 'https://avatars.githubusercontent.com/antirez?s=96',
    })
  })

  it('drops invalid logins', () => {
    expect(toPerson('javascript:alert(1)')).toBeNull()
    expect(toPerson('../../x')).toBeNull()
  })
})

describe('initials', () => {
  it('takes up to two word initials', () => {
    expect(initials('Kelsey Hightower')).toBe('KH')
    expect(initials('antirez')).toBe('A')
    expect(initials('a-b-c')).toBe('AB')
  })
})

describe('spotlightPosition', () => {
  const box = { left: 100, top: 50, width: 200, height: 120 }
  it('is relative to the card', () => {
    expect(spotlightPosition(150, 80, box)).toEqual({ x: 50, y: 30 })
  })
  it('clamps to the card edges', () => {
    expect(spotlightPosition(0, 999, box)).toEqual({ x: 0, y: 120 })
    expect(spotlightPosition(999, 0, box)).toEqual({ x: 200, y: 0 })
  })
})
