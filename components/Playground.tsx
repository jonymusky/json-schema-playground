"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { DragDropContext, DropResult } from '@hello-pangea/dnd'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { useUndo } from '@/hooks/useUndo'
import { createElement, duplicateElement } from '@/lib/fields'
import { ImportResult, toJsonSchema, toUiSchema } from '@/lib/schema'
import { buildShareUrl, decodeState, readSharedHash } from '@/lib/share'
import { EMPTY_FORM, TEMPLATES } from '@/lib/templates'
import { FieldType, FormElement, FormMeta, FormState } from '@/types'
import { Canvas, CANVAS_DROPPABLE } from './Canvas'
import { Footer } from './Footer'
import { Header } from './Header'
import { ImportSchemaDialog } from './ImportSchemaDialog'
import { JsonSchemaViewer } from './JsonSchemaViewer'
import { Palette, PALETTE_DROPPABLE } from './Palette'
import { Preview } from './Preview'

const STORAGE_KEY = 'json-schema-playground:v2'

const isFormState = (value: unknown): value is FormState =>
  Boolean(value) && typeof value === 'object' && Array.isArray((value as FormState).elements) && typeof (value as FormState).meta === 'object'

const isEditable = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))

const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'form'

export function Playground() {
  const { state: form, setState, resetState, canUndo, canRedo, undo, redo } = useUndo<FormState>(EMPTY_FORM)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  // Bumped whenever the whole form is replaced, so the preview starts with fresh data.
  const [formKey, setFormKey] = useState(0)
  const scrollTarget = useRef<string | null>(null)
  const { toast } = useToast()

  // Restore from a shared link first, then from the last session.
  useEffect(() => {
    const restore = async () => {
      const shared = readSharedHash()
      if (shared) {
        try {
          const state = await decodeState(shared)
          if (isFormState(state)) {
            resetState(state)
            toast({ title: 'Shared form loaded', description: 'Edits stay in your browser until you share again.' })
          }
        } catch {
          toast({ title: 'Couldn’t open the shared link', description: 'The link looks incomplete. Ask for a fresh one.', variant: 'destructive' })
        }
        window.history.replaceState(null, '', window.location.pathname + window.location.search)
        return
      }
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
        if (isFormState(saved)) resetState(saved)
      } catch {
        // Ignore unreadable storage and start empty.
      }
    }
    restore().finally(() => setHydrated(true))
  }, [resetState, toast])

  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
    } catch {
      // Storage can be full or blocked; autosave is best effort.
    }
  }, [form, hydrated])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || isEditable(event.target)) return
      const key = event.key.toLowerCase()
      if (key === 'z' && !event.shiftKey) {
        event.preventDefault()
        undo()
      } else if ((key === 'z' && event.shiftKey) || key === 'y') {
        event.preventDefault()
        redo()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [undo, redo])

  useEffect(() => {
    if (!scrollTarget.current) return
    document.getElementById(`field-${scrollTarget.current}`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    scrollTarget.current = null
  })

  const schema = useMemo(() => toJsonSchema(form), [form])
  const uiSchema = useMemo(() => toUiSchema(form), [form])

  const nameErrors = useMemo(() => {
    const errors: Record<string, string> = {}
    const counts = new Map<string, number>()
    form.elements.forEach((element) => counts.set(element.name, (counts.get(element.name) ?? 0) + 1))
    for (const element of form.elements) {
      if (!element.name) errors[element.id] = 'A field name is required.'
      else if ((counts.get(element.name) ?? 0) > 1) errors[element.id] = 'Another field already uses this name.'
    }
    return errors
  }, [form.elements])

  const setElements = useCallback(
    (elements: FormElement[], key?: string) => setState({ ...form, elements }, key),
    [form, setState]
  )

  const addElement = (type: FieldType, index = form.elements.length) => {
    const element = createElement(type, form.elements.map((e) => e.name))
    const elements = [...form.elements]
    elements.splice(index, 0, element)
    setElements(elements)
    setSelectedId(element.id)
    scrollTarget.current = element.id
  }

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result
    if (!destination || destination.droppableId !== CANVAS_DROPPABLE) return

    if (source.droppableId === PALETTE_DROPPABLE) {
      addElement(draggableId.replace('palette:', '') as FieldType, destination.index)
      return
    }
    if (source.index === destination.index) return
    const elements = [...form.elements]
    const [moved] = elements.splice(source.index, 1)
    elements.splice(destination.index, 0, moved)
    setElements(elements)
  }

  const updateElement = (updated: FormElement, key?: string) =>
    setElements(form.elements.map((element) => (element.id === updated.id ? updated : element)), key)

  const duplicate = (id: string) => {
    const index = form.elements.findIndex((element) => element.id === id)
    const copy = duplicateElement(form.elements[index], form.elements.map((e) => e.name))
    const elements = [...form.elements]
    elements.splice(index + 1, 0, copy)
    setElements(elements)
    setSelectedId(copy.id)
    scrollTarget.current = copy.id
  }

  const remove = (id: string) => {
    setElements(form.elements.filter((element) => element.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  const loadTemplate = (templateId: string) => {
    const template = TEMPLATES.find((t) => t.id === templateId)
    if (!template) return
    setState(template.create())
    setFormKey((key) => key + 1)
    setSelectedId(null)
    toast({ title: `Loaded “${template.name}”`, description: 'Press Undo to get your previous form back.' })
  }

  const handleImport = ({ state, skipped }: ImportResult) => {
    setState(state)
    setFormKey((key) => key + 1)
    setSelectedId(null)
    toast({
      title: `Imported ${state.elements.length} ${state.elements.length === 1 ? 'field' : 'fields'}`,
      description: skipped.length
        ? `Skipped unsupported properties: ${skipped.join(', ')}.`
        : 'Press Undo to get your previous form back.',
    })
  }

  const clear = () => {
    setState(EMPTY_FORM)
    setFormKey((key) => key + 1)
    setSelectedId(null)
    toast({ title: 'Form cleared', description: 'Press Undo to bring it back.' })
  }

  const share = async () => {
    try {
      const url = await buildShareUrl(form)
      await navigator.clipboard.writeText(url)
      toast({ title: 'Link copied', description: 'Anyone with the link opens a copy of this form.' })
    } catch {
      toast({ title: 'Couldn’t copy the link', description: 'Your browser blocked clipboard access.', variant: 'destructive' })
    }
  }

  const fileBase = slugify(form.meta.title)

  return (
    <div className="flex min-h-dvh flex-col lg:h-dvh">
      <Header
        canUndo={canUndo}
        canRedo={canRedo}
        canClear={form.elements.length > 0 || Boolean(form.meta.title || form.meta.description)}
        onUndo={undo}
        onRedo={redo}
        onTemplate={loadTemplate}
        onImport={() => setIsImportDialogOpen(true)}
        onShare={share}
        onClear={clear}
      />

      <div className="flex flex-1 flex-col lg:min-h-0 lg:flex-row">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Palette onAdd={(type) => addElement(type)} />
          <main className="canvas-surface flex-1 lg:min-h-0 lg:overflow-y-auto">
            <Canvas
              meta={form.meta}
              elements={form.elements}
              hydrated={hydrated}
              selectedId={selectedId}
              nameErrors={nameErrors}
              onSelect={setSelectedId}
              onMetaChange={(meta: FormMeta, key: string) => setState({ ...form, meta }, key)}
              onElementUpdate={updateElement}
              onElementDuplicate={duplicate}
              onElementDelete={remove}
              onTemplate={loadTemplate}
            />
          </main>
        </DragDropContext>

        <aside aria-label="Output" className="flex flex-col border-t bg-background lg:min-h-0 lg:w-[42%] lg:max-w-[640px] lg:border-l lg:border-t-0">
          <Tabs defaultValue="preview" className="flex flex-1 flex-col lg:min-h-0">
            <div className="shrink-0 border-b px-4 py-2">
              <TabsList className="h-9">
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="schema">JSON Schema</TabsTrigger>
                <TabsTrigger value="ui">UI Schema</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="preview" className="mt-0 flex-1 lg:min-h-0 lg:overflow-y-auto">
              <Preview key={formKey} form={form} schema={schema} />
            </TabsContent>
            <TabsContent value="schema" className="mt-0 flex-1 lg:min-h-0 lg:overflow-y-auto">
              <JsonSchemaViewer
                label="JSON Schema"
                value={schema}
                fileName={`${fileBase}.schema.json`}
                description="Describes the data. Validate submissions with any JSON Schema validator."
              />
            </TabsContent>
            <TabsContent value="ui" className="mt-0 flex-1 lg:min-h-0 lg:overflow-y-auto">
              <JsonSchemaViewer
                label="UI Schema"
                value={uiSchema}
                fileName={`${fileBase}.uischema.json`}
                description={
                  <>
                    Controls widgets, order and hints. Works with{' '}
                    <a
                      href="https://rjsf-team.github.io/react-jsonschema-form/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline underline-offset-4"
                    >
                      react-jsonschema-form
                    </a>
                    .
                  </>
                }
              />
            </TabsContent>
          </Tabs>
        </aside>
      </div>

      <Footer />

      <ImportSchemaDialog isOpen={isImportDialogOpen} onClose={() => setIsImportDialogOpen(false)} onImport={handleImport} />
    </div>
  )
}
