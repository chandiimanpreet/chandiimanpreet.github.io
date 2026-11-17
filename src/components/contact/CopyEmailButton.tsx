import { Check, Copy } from 'lucide-react'
import { useEffect, useRef, useState, type RefObject } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { copyText } from './contact'

const RESET_MS = 2000

type CopyState = 'idle' | 'copied' | 'failed'

export interface CopyEmailButtonProps {
  email: string
  /** Element showing the address; selected when copying fails so Ctrl+C works. */
  targetRef: RefObject<HTMLElement | null>
  className?: string
}

const LABEL: Record<CopyState, string> = { idle: 'Copy', copied: 'Copied', failed: 'Press Ctrl+C' }
const ANNOUNCE: Record<CopyState, string> = {
  idle: '',
  copied: 'Email address copied',
  failed: 'Copy failed. The address is selected: press Ctrl+C to copy it.',
}

export function CopyEmailButton({ email, targetRef, className }: CopyEmailButtonProps) {
  const [state, setState] = useState<CopyState>('idle')
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  async function onCopy() {
    const ok = await copyText(email)
    if (!ok && targetRef.current) window.getSelection()?.selectAllChildren(targetRef.current)
    setState(ok ? 'copied' : 'failed')
    window.clearTimeout(timer.current)
    if (ok) timer.current = window.setTimeout(() => setState('idle'), RESET_MS)
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => void onCopy()}
        aria-label={state === 'idle' ? 'Copy email address' : undefined}
        className={cn('min-h-target min-w-target', className)}
      >
        {state === 'copied' ? <Check aria-hidden className="text-ok" /> : <Copy aria-hidden />}
        {LABEL[state]}
      </Button>
      <span role="status" className="sr-only">
        {ANNOUNCE[state]}
      </span>
    </>
  )
}
