import React from 'react'
import { Draggable, Droppable } from '@hello-pangea/dnd'
import { FIELD_GROUPS, FieldDefinition } from '@/lib/fields'
import { FieldType } from '@/types'
import { cn } from '@/lib/utils'

export const PALETTE_DROPPABLE = 'palette'
export const paletteDraggableId = (type: FieldType) => `palette:${type}`

interface PaletteProps {
  onAdd: (type: FieldType) => void
}

function PaletteItem({ field, className }: { field: FieldDefinition; className?: string }) {
  const Icon = field.icon
  return (
    <span className={cn('flex items-center gap-2.5 rounded-md border bg-card px-2.5 py-2 text-sm', className)}>
      <Icon className="h-4 w-4 shrink-0 text-primary" />
      <span className="truncate">{field.label}</span>
    </span>
  )
}

export function Palette({ onAdd }: PaletteProps) {
  let index = 0

  return (
    <nav
      aria-label="Field types"
      className="shrink-0 border-b bg-background lg:w-56 lg:overflow-y-auto lg:border-b-0 lg:border-r"
    >
      <p className="hidden px-4 pt-4 text-xs text-muted-foreground lg:block">Click or drag a field into the form.</p>
      <Droppable droppableId={PALETTE_DROPPABLE} isDropDisabled direction="vertical">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex gap-4 overflow-x-auto px-4 py-3 lg:flex-col lg:gap-5 lg:overflow-visible lg:py-4"
          >
            {FIELD_GROUPS.map((group) => (
              <div key={group.title} className="shrink-0">
                <h2 className="mb-2 text-xs font-semibold text-muted-foreground">{group.title}</h2>
                <ul className="flex gap-1.5 lg:flex-col">
                  {group.fields.map((field) => {
                    const position = index++
                    return (
                      <Draggable key={field.type} draggableId={paletteDraggableId(field.type)} index={position}>
                        {(drag, snapshot) => (
                          <>
                            <li
                              ref={drag.innerRef}
                              {...drag.draggableProps}
                              {...drag.dragHandleProps}
                              role="button"
                              aria-label={`Add ${field.label}`}
                              title={field.hint}
                              onClick={() => onAdd(field.type)}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter') onAdd(field.type)
                              }}
                              className="cursor-grab rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
                            >
                              <PaletteItem
                                field={field}
                                className={cn(
                                  'whitespace-nowrap transition-colors hover:border-primary/50 hover:bg-accent',
                                  snapshot.isDragging && 'border-primary shadow-lg'
                                )}
                              />
                            </li>
                            {/* Keep a copy in place while the original is being dragged. */}
                            {snapshot.isDragging && (
                              <li aria-hidden>
                                <PaletteItem field={field} className="whitespace-nowrap opacity-50" />
                              </li>
                            )}
                          </>
                        )}
                      </Draggable>
                    )
                  })}
                </ul>
              </div>
            ))}
            <span className="hidden">{provided.placeholder}</span>
          </div>
        )}
      </Droppable>
    </nav>
  )
}
