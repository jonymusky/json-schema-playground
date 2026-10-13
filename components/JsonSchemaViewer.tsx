import React from 'react'
import { Check, Copy, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { CodeBlock } from './CodeBlock'

interface JsonSchemaViewerProps {
  label: string
  value: unknown
  fileName: string
  description: React.ReactNode
}

export function JsonSchemaViewer({ label, value, fileName, description }: JsonSchemaViewerProps) {
  const { toast } = useToast()
  const [copied, setCopied] = React.useState(false)
  const json = JSON.stringify(value, null, 2)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(json)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast({ title: 'Couldn’t copy', description: 'Your browser blocked clipboard access. Select the text and copy it manually.', variant: 'destructive' })
    }
  }

  const download = () => {
    const url = URL.createObjectURL(new Blob([json + '\n'], { type: 'application/json' }))
    const link = Object.assign(document.createElement('a'), { href: url, download: fileName })
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-3 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-prose text-sm text-muted-foreground">{description}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={copy}>
            {copied ? <Check className="mr-1.5 h-4 w-4 text-primary" /> : <Copy className="mr-1.5 h-4 w-4" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <Button variant="outline" size="sm" onClick={download}>
            <Download className="mr-1.5 h-4 w-4" /> Download
          </Button>
        </div>
      </div>
      <CodeBlock value={value} label={label} />
    </div>
  )
}
