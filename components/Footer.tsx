import React from 'react'
import { Github } from 'lucide-react'

export function Footer() {
  return (
    <footer className="flex shrink-0 flex-wrap items-center justify-between gap-x-6 gap-y-1 border-t bg-background px-4 py-2.5 text-xs text-muted-foreground">
      <p>
        Built by{' '}
        <a
          href="https://me.jonymusky.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-foreground underline decoration-primary/50 underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
        >
          Jonathan Muszkat
        </a>
      </p>
      <div className="flex items-center gap-4">
        <span className="hidden sm:inline">JSON Schema draft 2020-12, RJSF-compatible UI Schema</span>
        <a
          href="https://github.com/jonymusky/json-schema-playground"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 transition-colors hover:text-foreground"
        >
          <Github className="h-3.5 w-3.5" /> Source
        </a>
      </div>
    </footer>
  )
}
