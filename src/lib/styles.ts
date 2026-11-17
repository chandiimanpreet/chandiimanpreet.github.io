// Shared Tailwind class strings, so repeated styles cannot drift apart.

/**
 * Text link (DESIGN-V2 section 3): saffron and always underlined, so a link inside muted text is
 * never told apart by colour alone. The focus ring comes from the base `:focus-visible` rule.
 */
export const linkClass = 'text-primary underline decoration-1 underline-offset-4 hover:decoration-2'

/** A link that stands on its own (not inside running text): also a 44px touch target. */
export const targetLinkClass = `inline-flex min-h-target items-center ${linkClass}`
