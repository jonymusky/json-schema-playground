import React from 'react'
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button'
import { FormElement } from '@/types'
import { FileInputIcon as Input, Calendar, Clock, Upload } from 'lucide-react'

const formElements: FormElement[] = [
  { type: 'text', label: 'Text Input', name: 'textInput' },
  { type: 'number', label: 'Number Input', name: 'numberInput' },
  { type: 'checkbox', label: 'Checkbox', name: 'checkbox' },
  { type: 'radio', label: 'Radio Button', name: 'radioButton' },
  { type: 'select', label: 'Dropdown', name: 'dropdown' },
  { type: 'textarea', label: 'Text Area', name: 'textArea' },
  { type: 'date', label: 'Date Picker', name: 'datePicker' },
  { type: 'time', label: 'Time Picker', name: 'timePicker' },
  { type: 'file', label: 'File Upload', name: 'fileUpload' },
]

interface SidebarProps {
  onElementAdd: (element: FormElement) => void
}

export function Sidebar({ onElementAdd }: SidebarProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'date':
        return <Calendar className="mr-2 h-4 w-4" />
      case 'time':
        return <Clock className="mr-2 h-4 w-4" />
      case 'file':
        return <Upload className="mr-2 h-4 w-4" />
      default:
        return <Input className="mr-2 h-4 w-4" />
    }
  }

  return (
    <div className="w-64 bg-gray-100 p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Form Elements</h2>
      <Droppable droppableId="sidebar" isDropDisabled={true}>
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {formElements.map((element, index) => (
              <Draggable key={element.type} draggableId={element.type} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="mb-2"
                  >
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => onElementAdd(element)}
                    >
                      {getIcon(element.type)}
                      {element.label}
                    </Button>
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

