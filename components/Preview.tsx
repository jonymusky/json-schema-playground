import React from 'react'
import { FormElement } from '@/types'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface PreviewProps {
  elements: FormElement[]
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>, elementName: string) => void
}

export function Preview({ elements, onFileUpload }: PreviewProps) {
  const renderField = (element: FormElement) => {
    const isRequired = element.validation?.required
    const hideLabel = element.uiSchema?.['ui:hideLabel']

    const labelComponent = !hideLabel && (
      <Label htmlFor={element.name} className="mb-2 block">
        {element.label}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </Label>
    )

    const descriptionComponent = element.uiSchema?.['ui:description'] && (
      <p className="text-sm text-gray-500 mt-1" id={`${element.name}-description`}>
        {element.uiSchema['ui:description']}
      </p>
    )

    const commonProps = {
      id: element.name,
      name: element.name,
      placeholder: element.uiSchema?.['ui:placeholder'] || element.placeholder,
      required: isRequired,
      'aria-describedby': element.uiSchema?.['ui:description'] ? `${element.name}-description` : undefined,
      autoFocus: element.uiSchema?.['ui:autofocus'],
    }

    const fieldComponent = (() => {
      switch (element.type) {
        case 'text':
        case 'number':
          return (
            <Input
              type={element.type}
              {...commonProps}
              min={element.validation?.min}
              max={element.validation?.max}
              minLength={element.validation?.minLength}
              maxLength={element.validation?.maxLength}
            />
          )
        case 'checkbox':
          return (
            <div className="space-y-2">
              {element.options?.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center space-x-2">
                  <Checkbox id={`${element.name}-${optionIndex}`} {...commonProps} value={option.value} />
                  <Label htmlFor={`${element.name}-${optionIndex}`}>{option.label}</Label>
                </div>
              ))}
            </div>
          )
        case 'radio':
          return (
            <RadioGroup {...commonProps}>
              {element.options?.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`${element.name}-${optionIndex}`} />
                  <Label htmlFor={`${element.name}-${optionIndex}`}>{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
          )
        case 'select':
          return (
            <Select {...commonProps}>
              <SelectTrigger>
                <SelectValue placeholder={element.placeholder || "Select an option"} />
              </SelectTrigger>
              <SelectContent>
                {element.options?.filter(option => option.value !== '').map((option, optionIndex) => (
                  <SelectItem key={optionIndex} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )
        case 'textarea':
          return (
            <Textarea
              {...commonProps}
              minLength={element.validation?.minLength}
              maxLength={element.validation?.maxLength}
            />
          )
        case 'date':
          return <Input type="date" {...commonProps} />
        case 'time':
          return <Input type="time" {...commonProps} />
        case 'file':
          return (
            <Input
              type="file"
              {...commonProps}
              accept={element.uiSchema?.['ui:options']?.accept}
              onChange={(e) => onFileUpload(e, element.name)}
            />
          )
        default:
          return null
      }
    })()

    return (
      <div key={element.name} className="space-y-2 mb-4">
        {labelComponent}
        {fieldComponent}
        {descriptionComponent}
      </div>
    )
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Form Preview</h2>
      <form className="space-y-4">
        {elements.map(renderField)}
      </form>
    </div>
  )
}

