import React from 'react'
import { Draggable } from '@hello-pangea/dnd'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'
import { FormElement, FormElementOption } from '@/types'
import { Checkbox } from '@radix-ui/react-checkbox'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@radix-ui/react-select'
import { Textarea } from './ui/textarea'
import { Toggle } from './ui/toggle'

interface FormElementEditorProps {
  element: FormElement
  index: number
  onUpdate: (element: FormElement) => void
  onDelete: () => void
}

export function FormElementEditor({ element, index, onUpdate, onDelete }: FormElementEditorProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    onUpdate({ ...element, [e.target.name]: e.target.value })
  }

  const handleValidationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({
      ...element,
      validation: {
        ...element.validation,
        [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
      },
    })
  }

  const handleUiSchemaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    onUpdate({
      ...element,
      uiSchema: {
        ...element.uiSchema,
        [e.target.name]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value,
      },
    })
  }

  const handleOptionChange = (index: number, field: keyof FormElementOption, value: string) => {
    const newOptions = [...(element.options || [])]
    newOptions[index] = { ...newOptions[index], [field]: value }
    onUpdate({ ...element, options: newOptions })
  }

  const addOption = () => {
    const newOptions = [...(element.options || [])];
    const newIndex = newOptions.length;
    onUpdate({
      ...element,
      options: [...newOptions, { label: `Option ${newIndex + 1}`, value: `option${newIndex + 1}` }],
    })
  }

  const removeOption = (index: number) => {
    const newOptions = [...(element.options || [])]
    newOptions.splice(index, 1)
    onUpdate({ ...element, options: newOptions })
  }

  return (
    <Draggable draggableId={`element-${index}`} index={index}>
      {(provided) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="mb-4"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{element.label}</CardTitle>
            <Button variant="ghost" size="icon" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete element</span>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid w-full gap-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor={`label-${element.name}`}>Label</Label>
                  <Input
                    id={`label-${element.name}`}
                    name="label"
                    value={element.label}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor={`name-${element.name}`}>Field Name</Label>
                  <Input
                    id={`name-${element.name}`}
                    name="name"
                    value={element.name}
                    onChange={handleChange}
                  />
                </div>
              </div>
              {element.type !== 'checkbox' && element.type !== 'radio' && (
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor={`placeholder-${element.name}`}>Placeholder</Label>
                  <Input
                    id={`placeholder-${element.name}`}
                    name="placeholder"
                    value={element.placeholder}
                    onChange={handleChange}
                  />
                </div>
              )}
              {(element.type === 'select' || element.type === 'radio' || element.type === 'checkbox') && (
                <div className="flex flex-col space-y-1.5">
                  <Label>Options</Label>
                  {element.options?.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex space-x-2">
                      <Input
                        placeholder="Label"
                        value={option.label}
                        onChange={(e) => handleOptionChange(optionIndex, 'label', e.target.value)}
                      />
                      <Input
                        placeholder="Value"
                        value={option.value}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          // Ensure the value is not an empty string
                          handleOptionChange(optionIndex, 'value', newValue === '' ? `option${optionIndex + 1}` : newValue)
                        }}
                      />
                      <Button variant="ghost" size="icon" onClick={() => removeOption(optionIndex)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove option</span>
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addOption}>
                    <Plus className="h-4 w-4 mr-2" /> Add Option
                  </Button>
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col space-y-1.5">
                  <Label>Validation</Label>
                  <div className="flex items-center space-x-2">
  <Toggle
    pressed={element.validation?.required || false}
    onPressedChange={(pressed) =>
      handleValidationChange({
        target: { name: 'required', value: pressed },
      } as any)
    }
  >
    Autofocus
  </Toggle>
</div>
                  {(element.type === 'text' || element.type === 'textarea') && (
                    <>
                      <div className="flex flex-col space-y-1.5">
                        <Label htmlFor={`minLength-${element.name}`}>Min Length</Label>
                        <Input
                          id={`minLength-${element.name}`}
                          name="minLength"
                          type="number"
                          value={element.validation?.minLength || ''}
                          onChange={handleValidationChange}
                        />
                      </div>
                      <div className="flex flex-col space-y-1.5">
                        <Label htmlFor={`maxLength-${element.name}`}>Max Length</Label>
                        <Input
                          id={`maxLength-${element.name}`}
                          name="maxLength"
                          type="number"
                          value={element.validation?.maxLength || ''}
                          onChange={handleValidationChange}
                        />
                      </div>
                    </>
                  )}
                  {element.type === 'number' && (
                    <>
                      <div className="flex flex-col space-y-1.5">
                        <Label htmlFor={`min-${element.name}`}>Min Value</Label>
                        <Input
                          id={`min-${element.name}`}
                          name="min"
                          type="number"
                          value={element.validation?.min || ''}
                          onChange={handleValidationChange}
                        />
                      </div>
                      <div className="flex flex-col space-y-1.5">
                        <Label htmlFor={`max-${element.name}`}>Max Value</Label>
                        <Input
                          id={`max-${element.name}`}
                          name="max"
                          type="number"
                          value={element.validation?.max || ''}
                          onChange={handleValidationChange}
                        />
                      </div>
                    </>
                  )}
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label>UI Schema</Label>
                  <div className="flex items-center space-x-2">
                  <Toggle
    pressed={element.uiSchema?.['ui:hideLabel'] || false}
    onPressedChange={(pressed) =>
      handleUiSchemaChange({
        target: { name: 'ui:hideLabel', value: pressed },
      } as any)
    }
  >
    Hide Label
          </Toggle>
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor={`uiWidget-${element.name}`}>UI Widget</Label>
                    <Select
                      name="ui:widget"
                      value={element.uiSchema?.['ui:widget'] || "default"}
                      onValueChange={(value) => handleUiSchemaChange({ target: { name: 'ui:widget', value } } as any)}
                    >
                      <SelectTrigger id={`uiWidget-${element.name}`}>
                        <SelectValue placeholder="Select a widget" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="textarea">Textarea</SelectItem>
                        <SelectItem value="select">Select</SelectItem>
                        <SelectItem value="radio">Radio</SelectItem>
                        <SelectItem value="checkboxes">Checkboxes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor={`uiDescription-${element.name}`}>UI Description</Label>
                    <Textarea
                      id={`uiDescription-${element.name}`}
                      name="ui:description"
                      value={element.uiSchema?.['ui:description'] || ''}
                      onChange={handleUiSchemaChange}
                      placeholder="Additional description for the field"
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor={`uiPlaceholder-${element.name}`}>UI Placeholder</Label>
                    <Input
                      id={`uiPlaceholder-${element.name}`}
                      name="ui:placeholder"
                      value={element.uiSchema?.['ui:placeholder'] || ''}
                      onChange={handleUiSchemaChange}
                      placeholder="Custom placeholder text"
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor={`uiAutofocus-${element.name}`}>Auto Focus</Label>
                    <Toggle
    pressed={element.uiSchema?.['ui:autofocus'] || false}
    onPressedChange={(pressed) =>
      handleUiSchemaChange({
        target: { name: 'ui:autofocus', value: pressed },
      } as any)
    }
  >
    Autofocus
  </Toggle>
                      
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </Draggable>
  )
}

