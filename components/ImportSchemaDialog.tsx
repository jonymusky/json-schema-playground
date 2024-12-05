import React, { useState } from 'react'
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
import { useToast } from '@/components/ui/use-toast'

interface ImportSchemaDialogProps {
  isOpen: boolean
  onClose: () => void
  onImport: (jsonSchema: any, uiSchema: any) => void
}

export function ImportSchemaDialog({ isOpen, onClose, onImport }: ImportSchemaDialogProps) {
  const [jsonSchema, setJsonSchema] = useState('')
  const [uiSchema, setUiSchema] = useState('')
  const { toast } = useToast()

  const handleImport = () => {
    try {
      const parsedJsonSchema = JSON.parse(jsonSchema)
      const parsedUiSchema = JSON.parse(uiSchema)
      onImport(parsedJsonSchema, parsedUiSchema)
      onClose()
      toast({
        title: "Success",
        description: "Schema imported successfully.",
      })
    } catch (error) {
      console.error('Failed to parse schema:', error)
      toast({
        title: "Error",
        description: "Failed to parse schema. Please check your input.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import Schema</DialogTitle>
          <DialogDescription>
            Paste your JSON Schema and UI Schema here.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="jsonSchema">JSON Schema</Label>
            <Textarea
              id="jsonSchema"
              value={jsonSchema}
              onChange={(e) => setJsonSchema(e.target.value)}
              placeholder="Paste your JSON Schema here..."
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="uiSchema">UI Schema</Label>
            <Textarea
              id="uiSchema"
              value={uiSchema}
              onChange={(e) => setUiSchema(e.target.value)}
              placeholder="Paste your UI Schema here..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleImport}>Import</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

