// Pure helpers for the Contact section, kept out of the components so they can be unit-tested.

/** `mailto:` URL with subject/body percent-encoded (spaces as %20, newlines as %0A, never `+`). */
export function mailtoHref(email: string, template?: { subject?: string; body?: string }): string {
  const params: string[] = []
  if (template?.subject) params.push(`subject=${encodeURIComponent(template.subject)}`)
  if (template?.body) params.push(`body=${encodeURIComponent(template.body)}`)
  return `mailto:${email}${params.length ? `?${params.join('&')}` : ''}`
}

/**
 * Copies text. Tries the async Clipboard API, then the legacy execCommand path (older Safari,
 * non-secure contexts). Resolves false when both fail so the caller can fall back to
 * "Press Ctrl+C" with the text selected.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // fall through to the legacy path
  }
  const area = document.createElement('textarea')
  area.value = text
  area.setAttribute('readonly', '')
  area.style.position = 'fixed'
  area.style.opacity = '0'
  document.body.append(area)
  try {
    area.select()
    return document.execCommand('copy')
  } catch {
    return false
  } finally {
    area.remove()
  }
}
