import React, { useMemo } from 'react'
import { cn } from '@/lib/utils'

const TOKEN = /("(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(?:true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g

const shorten = (_key: string, value: unknown) =>
  typeof value === 'string' && value.length > 80 && value.startsWith('data:') ? `${value.slice(0, 48)}…` : value

/** Pretty-printed, syntax-highlighted JSON. */
export function CodeBlock({
  value,
  label,
  truncateStrings,
  className,
}: {
  value: unknown
  label?: string
  truncateStrings?: boolean
  className?: string
}) {
  const parts = useMemo(() => {
    const json = JSON.stringify(value, truncateStrings ? shorten : undefined, 2) ?? ''
    const nodes: React.ReactNode[] = []
    let last = 0
    for (const match of json.matchAll(TOKEN)) {
      const [token, , colon] = match
      const index = match.index ?? 0
      if (index > last) nodes.push(json.slice(last, index))
      const kind = colon ? 'tok-key' : token.startsWith('"') ? 'tok-string' : /^[tfn]/.test(token) ? 'tok-literal' : 'tok-number'
      nodes.push(
        <span key={index} className={kind}>
          {colon ? token.slice(0, token.length - colon.length) : token}
        </span>
      )
      if (colon) nodes.push(colon)
      last = index + token.length
    }
    nodes.push(json.slice(last))
    return nodes
  }, [value, truncateStrings])

  return (
    <pre aria-label={label} tabIndex={0} className={cn('overflow-auto rounded-lg border bg-muted/50 p-4 font-mono text-[13px] leading-relaxed', className)}>
      <code>{parts}</code>
    </pre>
  )
}
