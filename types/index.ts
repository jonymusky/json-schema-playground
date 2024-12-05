export interface FormElementOption {
  label: string
  value: string
}

export interface FormElementValidation {
  required?: boolean
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  pattern?: string
}

export interface UiSchema {
  'ui:widget'?: string
  'ui:options'?: {
    inline?: boolean
    rows?: number
    accept?: string
    format?: string
  }
  'ui:order'?: string[]
  'ui:disabled'?: boolean
  'ui:readonly'?: boolean
  'ui:description'?: string
  'ui:placeholder'?: string
  'ui:autocomplete'?: string
  'ui:autofocus'?: boolean
  'ui:enumDisabled'?: string[]
  classNames?: string
  'ui:before'?: string
  'ui:after'?: string
  'ui:hideLabel'?: boolean
}

export interface FormElement {
  type: 'text' | 'number' | 'checkbox' | 'radio' | 'select' | 'textarea' | 'date' | 'time' | 'file'
  label: string
  name: string
  placeholder?: string
  options?: FormElementOption[]
  validation?: FormElementValidation
  uiSchema?: UiSchema
}

export interface JsonSchema {
  type: 'object'
  properties: {
    [key: string]: {
      type: string
      title: string
      description?: string
      enum?: string[]
      format?: string
      minLength?: number
      maxLength?: number
      minimum?: number
      maximum?: number
      pattern?: string
    }
  }
  required?: string[]
}

