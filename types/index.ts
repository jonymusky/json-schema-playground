export type FieldType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'url'
  | 'password'
  | 'tel'
  | 'number'
  | 'integer'
  | 'range'
  | 'boolean'
  | 'select'
  | 'radio'
  | 'checkboxes'
  | 'date'
  | 'time'
  | 'datetime'
  | 'color'
  | 'file'

export type FieldValue = string | number | boolean | string[]

export interface FormElementOption {
  label: string
  value: string
}

export interface FormElementValidation {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: string
  minimum?: number
  maximum?: number
  multipleOf?: number
  minItems?: number
  maxItems?: number
}

export interface FormElementUi {
  hideLabel?: boolean
  disabled?: boolean
  readonly?: boolean
  autofocus?: boolean
  inline?: boolean
  rows?: number
  accept?: string
}

export interface FormElement {
  id: string
  type: FieldType
  name: string
  label: string
  description?: string
  placeholder?: string
  help?: string
  defaultValue?: FieldValue
  options?: FormElementOption[]
  validation: FormElementValidation
  ui: FormElementUi
}

export interface FormMeta {
  title: string
  description: string
}

export interface FormState {
  meta: FormMeta
  elements: FormElement[]
}

export type JsonSchemaProperty = Record<string, unknown>

export interface JsonSchema {
  $schema?: string
  type: 'object'
  title?: string
  description?: string
  properties: Record<string, JsonSchemaProperty>
  required?: string[]
}

export type UiSchema = Record<string, unknown>
