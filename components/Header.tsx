import React from 'react'
import { Eraser, FileUp, LayoutTemplate, Redo2, Share2, Undo2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TEMPLATES } from '@/lib/templates'
import { DarkModeToggle } from './DarkModeToggle'

interface HeaderProps {
  canUndo: boolean
  canRedo: boolean
  canClear: boolean
  onUndo: () => void
  onRedo: () => void
  onTemplate: (templateId: string) => void
  onImport: () => void
  onShare: () => void
  onClear: () => void
}

export function Header({ canUndo, canRedo, canClear, onUndo, onRedo, onTemplate, onImport, onShare, onClear }: HeaderProps) {
  return (
    <header className="flex shrink-0 items-center justify-between gap-3 border-b bg-background px-4 py-2.5">
      <div className="flex min-w-0 items-center gap-3">
        <span
          aria-hidden
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary font-mono text-sm font-medium text-primary-foreground"
        >
          {'{}'}
        </span>
        <h1 className="sr-only truncate text-base font-semibold tracking-tight sm:not-sr-only">
          JSON Schema <span className="font-normal text-muted-foreground">Playground</span>
        </h1>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon-sm" onClick={onUndo} disabled={!canUndo} title="Undo (⌘Z)">
          <Undo2 className="h-4 w-4" />
          <span className="sr-only">Undo</span>
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={onRedo} disabled={!canRedo} title="Redo (⇧⌘Z)">
          <Redo2 className="h-4 w-4" />
          <span className="sr-only">Redo</span>
        </Button>
        <span className="mx-1 hidden h-5 w-px bg-border sm:block" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="px-2 sm:px-3">
              <LayoutTemplate className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Templates</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            {TEMPLATES.map((template) => (
              <DropdownMenuItem key={template.id} onClick={() => onTemplate(template.id)} className="flex-col items-start gap-0">
                <span className="text-sm font-medium">{template.name}</span>
                <span className="text-xs text-muted-foreground">{template.summary}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="sm" className="px-2 sm:px-3" onClick={onImport}>
          <FileUp className="h-4 w-4 sm:mr-1.5" />
          <span className="hidden sm:inline">Import</span>
        </Button>
        <Button variant="ghost" size="sm" className="px-2 sm:px-3" onClick={onClear} disabled={!canClear}>
          <Eraser className="h-4 w-4 sm:mr-1.5" />
          <span className="hidden sm:inline">Clear</span>
        </Button>
        <Button size="sm" className="ml-1 px-2 sm:px-3" onClick={onShare} disabled={!canClear}>
          <Share2 className="h-4 w-4 sm:mr-1.5" />
          <span className="hidden sm:inline">Share link</span>
        </Button>
        <DarkModeToggle />
      </div>
    </header>
  )
}
