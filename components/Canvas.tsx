import React from 'react'
import { Draggable, Droppable } from '@hello-pangea/dnd'
import { FormElement, FormMeta } from '@/types'
import { TEMPLATES } from '@/lib/templates'
import { cn } from '@/lib/utils'
import { FormElementEditor } from './FormElementEditor'

export const CANVAS_DROPPABLE = 'canvas'

interface CanvasProps {
  meta: FormMeta
  elements: FormElement[]
  hydrated: boolean
  selectedId: string | null
  nameErrors: Record<string, string>
  onSelect: (id: string | null) => void
  onMetaChange: (meta: FormMeta, key: string) => void
  onElementUpdate: (element: FormElement, key?: string) => void
  onElementDuplicate: (id: string) => void
  onElementDelete: (id: string) => void
  onTemplate: (templateId: string) => void
}

export function Canvas({
  meta,
  elements,
  hydrated,
  selectedId,
  nameErrors,
  onSelect,
  onMetaChange,
  onElementUpdate,
  onElementDuplicate,
  onElementDelete,
  onTemplate,
}: CanvasProps) {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
      <div className="mb-6 space-y-1">
        <input
          aria-label="Form title"
          placeholder="Untitled form"
          value={meta.title}
          onChange={(e) => onMetaChange({ ...meta, title: e.target.value }, 'meta:title')}
          className="w-full rounded-md bg-transparent px-1 py-0.5 text-2xl font-semibold tracking-tight placeholder:text-muted-foreground/60 hover:bg-card/70 focus:bg-card focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <input
          aria-label="Form description"
          placeholder="Add a description"
          value={meta.description}
          onChange={(e) => onMetaChange({ ...meta, description: e.target.value }, 'meta:description')}
          className="w-full rounded-md bg-transparent px-1 py-0.5 text-sm text-muted-foreground placeholder:text-muted-foreground/60 hover:bg-card/70 focus:bg-card focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <Droppable droppableId={CANVAS_DROPPABLE}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'min-h-[12rem] rounded-xl transition-colors',
              snapshot.isDraggingOver && 'bg-accent/40 outline-dashed outline-2 outline-offset-4 outline-primary/40'
            )}
          >
            {hydrated && elements.length === 0 && !snapshot.isDraggingOver && <EmptyState onTemplate={onTemplate} />}
            {elements.map((element, index) => (
              <Draggable key={element.id} draggableId={element.id} index={index}>
                {(drag, dragSnapshot) => (
                  <div ref={drag.innerRef} {...drag.draggableProps} id={`field-${element.id}`} className="scroll-mt-4 pb-3">
                    <FormElementEditor
                      element={element}
                      expanded={selectedId === element.id}
                      nameError={nameErrors[element.id]}
                      dragHandleProps={drag.dragHandleProps}
                      isDragging={dragSnapshot.isDragging}
                      onToggle={() => onSelect(selectedId === element.id ? null : element.id)}
                      onUpdate={onElementUpdate}
                      onDuplicate={() => onElementDuplicate(element.id)}
                      onDelete={() => onElementDelete(element.id)}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}

function EmptyState({ onTemplate }: { onTemplate: (templateId: string) => void }) {
  return (
    <div className="rounded-xl border border-dashed bg-card/60 px-6 py-10 text-center">
      <h2 className="text-base font-semibold">Start with a field or a template</h2>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
        Pick a field type from the list, drag it here, or load one of these examples.
      </p>
      <div className="mt-6 grid gap-2 text-left sm:grid-cols-2">
        {TEMPLATES.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => onTemplate(template.id)}
            className="rounded-lg border bg-card px-4 py-3 transition-colors hover:border-primary/50 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="block text-sm font-medium">{template.name}</span>
            <span className="block text-xs text-muted-foreground">{template.summary}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
