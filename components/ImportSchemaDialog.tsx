import React, { useRef, useState } from 'react'
import { FileUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { fromJsonSchema, ImportResult } from '@/lib/schema'

interface ImportSchemaDialogProps {
  isOpen: boolean
  onClose: () => void
  onImport: (result: ImportResult) => void
}

function parse(label: string, text: string) {
  if (!text.trim()) return undefined
  try {
    return JSON.parse(text)
  } catch (error) {
    throw new Error(`${label} isn’t valid JSON: ${error instanceof Error ? error.message : error}`)
  }
}

export function ImportSchemaDialog({ isOpen, onClose, onImport }: ImportSchemaDialogProps) {
  const [jsonSchema, setJsonSchema] = useState('')
  const [uiSchema, setUiSchema] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleImport = () => {
    try {
      const schema = parse('JSON Schema', jsonSchema)
      if (schema === undefined) throw new Error('Paste a JSON Schema or load a file first.')
      const result = fromJsonSchema(schema, parse('UI Schema', uiSchema))
      if (!result.state.elements.length) throw new Error('No supported fields were found in this schema.')
      onImport(result)
      setJsonSchema('')
      setUiSchema('')
      setError(null)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setError(null)
          onClose()
        }
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import a schema</DialogTitle>
          <DialogDescription>
            Paste a JSON Schema with top-level properties. The UI Schema is optional. A file containing
            {' '}<code className="font-mono text-xs">{'{ "schema", "uiSchema" }'}</code> works too.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <JsonInput id="import-json-schema" label="JSON Schema" value={jsonSchema} onChange={setJsonSchema} />
          <JsonInput id="import-ui-schema" label="UI Schema (optional)" value={uiSchema} onChange={setUiSchema} />
        </div>
        {error && (
          <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleImport}>Import and replace form</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function JsonInput({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (value: string) => void }) {
  const fileInput = useRef<HTMLInputElement>(null)

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => fileInput.current?.click()}>
          <FileUp className="mr-1.5 h-3.5 w-3.5" /> Load file
        </Button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0]
            if (file) onChange(await file.text())
            e.target.value = ''
          }}
        />
      </div>
      <Textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        placeholder="{ … }"
        className="h-56 resize-y font-mono text-xs"
      />
    </div>
  )
}
