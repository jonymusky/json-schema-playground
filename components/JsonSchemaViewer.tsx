import React from 'react'
import { JsonSchema, UiSchema } from '@/types'
import { Button } from '@/components/ui/button'
import { Copy } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface JsonSchemaViewerProps {
  schema: JsonSchema
  uiSchema: Record<string, UiSchema>
  onImport: () => void
}

export function JsonSchemaViewer({ schema, uiSchema, onImport }: JsonSchemaViewerProps) {
  const { toast } = useToast()

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: `${label} has been copied to clipboard.`,
      })
    }).catch((err) => {
      console.error('Failed to copy: ', err)
      toast({
        title: "Error",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      })
    })
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">JSON Schema</h2>
        <Button onClick={() => copyToClipboard(JSON.stringify(schema, null, 2), "JSON Schema")}>
          <Copy className="mr-2 h-4 w-4" /> Copy JSON Schema
        </Button>
      </div>
      <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
        {JSON.stringify(schema, null, 2)}
      </pre>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">UI Schema</h2>
        <Button onClick={() => copyToClipboard(JSON.stringify(uiSchema, null, 2), "UI Schema")}>
          <Copy className="mr-2 h-4 w-4" /> Copy UI Schema
        </Button>
      </div>
      <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
        {JSON.stringify(uiSchema, null, 2)}
      </pre>

      <div className="flex justify-end">
        <Button onClick={onImport}>Import Schema</Button>
      </div>
    </div>
  )
}

