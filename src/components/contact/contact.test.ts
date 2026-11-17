import { afterEach, describe, expect, it, vi } from 'vitest'

import { mailTemplates } from '@/content/contact'

import { copyText, formatLocalTime, mailtoHref } from './contact'

const EMAIL = 'someone@example.com'

describe('mailtoHref', () => {
  it('is a bare mailto without a template', () => {
    expect(mailtoHref(EMAIL)).toBe(`mailto:${EMAIL}`)
  })

  it('percent-encodes subject and body (no + for spaces, %0A for newlines)', () => {
    const href = mailtoHref(EMAIL, { subject: 'Backend role at ', body: 'Role:\nTeam: a&b=c?' })
    expect(href).toBe(
      `mailto:${EMAIL}?subject=Backend%20role%20at%20&body=Role%3A%0ATeam%3A%20a%26b%3Dc%3F`,
    )
  })

  it('omits an empty body', () => {
    const [, natalie] = mailTemplates
    expect(mailtoHref(EMAIL, natalie)).toBe(`mailto:${EMAIL}?subject=About%20Natalie`)
  })
})

describe('copyText', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  function stubClipboard(writeText: () => Promise<void>) {
    vi.stubGlobal('navigator', { clipboard: { writeText } })
  }
  function stubExec(result: boolean | Error) {
    const fn = vi.fn(() => {
      if (result instanceof Error) throw result
      return result
    })
    Object.defineProperty(document, 'execCommand', { value: fn, configurable: true })
    return fn
  }

  it('uses the Clipboard API when it works', async () => {
    const writeText = vi.fn(() => Promise.resolve())
    stubClipboard(writeText)
    const exec = stubExec(false)
    await expect(copyText(EMAIL)).resolves.toBe(true)
    expect(writeText).toHaveBeenCalledWith(EMAIL)
    expect(exec).not.toHaveBeenCalled()
  })

  it('falls back to execCommand and cleans up the textarea', async () => {
    stubClipboard(() => Promise.reject(new Error('denied')))
    const exec = stubExec(true)
    await expect(copyText(EMAIL)).resolves.toBe(true)
    expect(exec).toHaveBeenCalledWith('copy')
    expect(document.querySelector('textarea')).toBeNull()
  })

  it('resolves false when both paths fail (caller shows "Press Ctrl+C")', async () => {
    vi.stubGlobal('navigator', {}) // no Clipboard API at all
    stubExec(new Error('unsupported'))
    await expect(copyText(EMAIL)).resolves.toBe(false)
    stubExec(false)
    await expect(copyText(EMAIL)).resolves.toBe(false)
  })
})

describe('formatLocalTime', () => {
  it('formats in the given zone, not the machine zone', () => {
    const t = formatLocalTime(new Date('2026-01-01T10:12:00Z'), 'Asia/Kolkata')
    expect(t).toMatch(/^3:42\sPM GMT\+5:30$/)
  })
})
