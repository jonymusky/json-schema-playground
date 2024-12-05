"use client"

import React, { useState } from 'react'
import { DragDropContext, DropResult, Droppable } from '@hello-pangea/dnd';
import { Sidebar } from './Sidebar'
import { Canvas } from './Canvas'
import { Preview } from './Preview'
import { JsonSchemaViewer } from './JsonSchemaViewer'
import { ImportSchemaDialog } from './ImportSchemaDialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Undo2, Redo2 } from 'lucide-react'
import { useUndo } from '@/hooks/useUndo'
import { FormElement, JsonSchema, UiSchema } from '@/types'
import { DarkModeToggle } from './DarkModeToggle'

export function Playground() {
  const [formElements, setFormElements] = useState<FormElement[]>([])
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'json'>('editor')
  const { state, setState, canUndo, canRedo, undo, redo } = useUndo<FormElement[]>([])
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return
    }

    const newElements = Array.from(formElements)
    const [reorderedItem] = newElements.splice(result.source.index, 1)
    newElements.splice(result.destination.index, 0, reorderedItem)

    setFormElements(newElements)
    setState(newElements)
  }

  const handleElementAdd = (element: FormElement) => {
    const newElements = [...formElements, element]
    setFormElements(newElements)
    setState(newElements)
  }

  const handleElementUpdate = (index: number, updatedElement: FormElement) => {
    const newElements = [...formElements]
    newElements[index] = updatedElement
    setFormElements(newElements)
    setState(newElements)
  }

  const handleElementDelete = (index: number) => {
    const newElements = formElements.filter((_, i) => i !== index)
    setFormElements(newElements)
    setState(newElements)
  }

  const generateJsonSchema = (): JsonSchema => {
    const properties: JsonSchema['properties'] = {}
    const required: string[] = []

    formElements.forEach((element) => {
      const property: JsonSchema['properties'][string] = {
        type: element.type === 'number' ? 'number' : 'string',
        title: element.label,
      }

      if (element.placeholder) {
        property.description = element.placeholder
      }

      if (element.type === 'select' || element.type === 'radio' || element.type === 'checkbox') {
        property.enum = element.options?.map((option) => option.value)
      }

      if (element.validation) {
        if (element.validation.required) {
          required.push(element.name)
        }
        if (element.validation.minLength !== undefined) {
          property.minLength = element.validation.minLength
        }
        if (element.validation.maxLength !== undefined) {
          property.maxLength = element.validation.maxLength
        }
        if (element.validation.min !== undefined) {
          property.minimum = element.validation.min
        }
        if (element.validation.max !== undefined) {
          property.maximum = element.validation.max
        }
        if (element.validation.pattern) {
          property.pattern = element.validation.pattern
        }
      }

      properties[element.name] = property
    })

    return {
      type: 'object',
      properties,
      required: required.length > 0 ? required : undefined,
    }
  }

  const generateUiSchema = () => {
    const uiSchema: Record<string, UiSchema> = {}

    formElements.forEach((element) => {
      if (element.uiSchema) {
        uiSchema[element.name] = { ...element.uiSchema }
      }
    })

    return uiSchema
  }

  const handleImportSchema = (jsonSchema: JsonSchema, uiSchema: Record<string, any>) => {
    // Convert imported schema back to form elements
    const newFormElements: FormElement[] = Object.entries(jsonSchema.properties).map(([name, prop]: [string, any]) => {
      // Map the type correctly
      let formElementType: FormElement["type"];
      switch (prop.type) {
        case "string":
          formElementType = uiSchema[name]?.["ui:widget"] === "textarea" ? "textarea" : "text";
          break;
        case "number":
          formElementType = "number";
          break;
        case "boolean":
          formElementType = "checkbox";
          break;
        case "array":
          formElementType = "select";
          break;
        case "object":
          formElementType = "file"; // Default to file for complex types (adjust as needed)
          break;
        default:
          throw new Error(`Unsupported type: ${prop.type}`);
      }
  
      return {
        type: formElementType,
        label: prop.title || name,
        name,
        placeholder: uiSchema[name]?.["ui:placeholder"] || undefined,
        options: prop.enum
          ? prop.enum.map((value: string) => ({ label: value, value }))
          : undefined,
        validation: {
          required: jsonSchema.required?.includes(name) || false,
          minLength: prop.minLength || undefined,
          maxLength: prop.maxLength || undefined,
          min: prop.minimum || undefined,
          max: prop.maximum || undefined,
          pattern: prop.pattern || undefined,
        },
      };
    });
  
    // Update state with new form elements
    setFormElements(newFormElements);
    setState(newFormElements);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, elementName: string) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log(`File uploaded for ${elementName}:`, file.name);
      // Here you would typically handle the file, e.g., send it to a server
    }
  };

  return (
    <div className="flex h-screen">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Sidebar onElementAdd={handleElementAdd} />
        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-center p-4 border-b">
            <h1 className="text-2xl font-bold">JSON Schema Form Playground</h1>
            <div className="flex space-x-2 items-center">
              <Button onClick={undo} disabled={!canUndo} size="icon">
                <Undo2 className="h-4 w-4" />
              </Button>
              <Button onClick={redo} disabled={!canRedo} size="icon">
                <Redo2 className="h-4 w-4" />
              </Button>
              <DarkModeToggle />
            </div>
          </div>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="flex-1">
            <TabsList>
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="json">JSON Schema</TabsTrigger>
            </TabsList>
            <TabsContent value="editor" className="flex-1">
              <Droppable droppableId="canvas">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="flex-1 p-4 bg-gray-50 overflow-y-auto"
                  >
                    <Canvas
                      onDragEnd={handleDragEnd}
                      elements={formElements}
                      onElementUpdate={handleElementUpdate}
                      onElementDelete={handleElementDelete}
                    />
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </TabsContent>
            <TabsContent value="preview" className="flex-1">
              <Preview elements={formElements} onFileUpload={handleFileUpload} />
            </TabsContent>
            <TabsContent value="json" className="flex-1">
              <JsonSchemaViewer 
                schema={generateJsonSchema()} 
                uiSchema={generateUiSchema()}
                onImport={() => setIsImportDialogOpen(true)}
              />
            </TabsContent>
          </Tabs>
        </div>
      </DragDropContext>
      <ImportSchemaDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onImport={handleImportSchema}
      />
    </div>
  )
}

