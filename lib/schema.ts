import {
  FieldType,
  FieldValue,
  FormElement,
  FormElementOption,
  FormElementValidation,
  FormState,
  JsonSchema,
  JsonSchemaProperty,
  UiSchema,
} from '@/types'
import { createId, hasOptions, LENGTH_TYPES, NUMERIC_TYPES, PATTERN_TYPES, sanitizeName, uniqueName } from './fields'

export const SCHEMA_DIALECT = 'https://json-schema.org/draft/2020-12/schema'

const STRING_FORMATS: Partial<Record<FieldType, string>> = {
  email: 'email',
  url: 'uri',
  date: 'date',
  time: 'time',
  datetime: 'date-time',
  file: 'data-url',
}

const WIDGETS: Partial<Record<FieldType, string>> = {
  textarea: 'textarea',
  password: 'password',
  range: 'range',
  radio: 'radio',
  checkboxes: 'checkboxes',
  color: 'color',
}

const isSet = <T,>(value: T | undefined | null | ''): value is T =>
  value !== undefined && value !== null && value !== ''

function optionsSchema(options: FormElementOption[] = []): JsonSchemaProperty {
  const usable = options.filter((option) => option.value !== '')
  const labelled = usable.some((option) => option.label && option.label !== option.value)
  return labelled
    ? { oneOf: usable.map((option) => ({ const: option.value, title: option.label || option.value })) }
    : { enum: usable.map((option) => option.value) }
}

function baseType(type: FieldType): string {
  switch (type) {
    case 'number':
    case 'range':
      return 'number'
    case 'integer':
      return 'integer'
    case 'boolean':
      return 'boolean'
    case 'checkboxes':
      return 'array'
    default:
      return 'string'
  }
}

export function elementToProperty(element: FormElement): JsonSchemaProperty {
  const { type, validation } = element
  const property: JsonSchemaProperty = { type: baseType(type), title: element.label }

  if (element.description) property.description = element.description
  if (STRING_FORMATS[type]) property.format = STRING_FORMATS[type]

  if (type === 'checkboxes') {
    property.items = { type: 'string', ...optionsSchema(element.options) }
    property.uniqueItems = true
    if (isSet(validation.minItems)) property.minItems = validation.minItems
    if (isSet(validation.maxItems)) property.maxItems = validation.maxItems
  } else if (hasOptions(type)) {
    Object.assign(property, optionsSchema(element.options))
  }

  if (LENGTH_TYPES.includes(type)) {
    if (isSet(validation.minLength)) property.minLength = validation.minLength
    if (isSet(validation.maxLength)) property.maxLength = validation.maxLength
  }
  if (PATTERN_TYPES.includes(type) && validation.pattern) property.pattern = validation.pattern
  if (type === 'color') property.pattern = '^#[0-9a-fA-F]{6}$'

  if (NUMERIC_TYPES.includes(type)) {
    if (isSet(validation.minimum)) property.minimum = validation.minimum
    if (isSet(validation.maximum)) property.maximum = validation.maximum
    if (isSet(validation.multipleOf) && validation.multipleOf > 0) property.multipleOf = validation.multipleOf
  }

  if (isSet(element.defaultValue) && !(Array.isArray(element.defaultValue) && element.defaultValue.length === 0)) {
    property.default = element.defaultValue
  }
  if (element.ui.readonly) property.readOnly = true

  return property
}

export function toJsonSchema({ meta, elements }: FormState): JsonSchema {
  const schema: JsonSchema = {
    $schema: SCHEMA_DIALECT,
    ...(meta.title && { title: meta.title }),
    ...(meta.description && { description: meta.description }),
    type: 'object',
    properties: {},
  }

  const required: string[] = []
  for (const element of elements) {
    if (!element.name) continue
    schema.properties[element.name] = elementToProperty(element)
    if (element.validation.required) required.push(element.name)
  }
  if (required.length) schema.required = required
  return schema
}

export function elementToUi(element: FormElement): UiSchema {
  const ui: UiSchema = {}
  const options: Record<string, unknown> = {}

  if (WIDGETS[element.type]) ui['ui:widget'] = WIDGETS[element.type]
  if (element.type === 'tel') options.inputType = 'tel'
  if (element.placeholder) ui['ui:placeholder'] = element.placeholder
  if (element.help) ui['ui:help'] = element.help
  if (element.ui.hideLabel) ui['ui:label'] = false
  if (element.ui.disabled) ui['ui:disabled'] = true
  if (element.ui.readonly) ui['ui:readonly'] = true
  if (element.ui.autofocus) ui['ui:autofocus'] = true
  if (element.type === 'textarea' && element.ui.rows) options.rows = element.ui.rows
  if (element.type === 'file' && element.ui.accept) options.accept = element.ui.accept
  if ((element.type === 'radio' || element.type === 'checkboxes') && element.ui.inline) options.inline = true

  if (Object.keys(options).length) ui['ui:options'] = options
  return ui
}

export function toUiSchema({ elements }: FormState): UiSchema {
  const uiSchema: UiSchema = {}
  for (const element of elements) {
    if (!element.name) continue
    const ui = elementToUi(element)
    if (Object.keys(ui).length) uiSchema[element.name] = ui
  }
  uiSchema['ui:order'] = elements.filter((element) => element.name).map((element) => element.name)
  return uiSchema
}

// ---------------------------------------------------------------------------
// Import

export interface ImportResult {
  state: FormState
  skipped: string[]
}

// Imported schemas are untyped user input.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Prop = Record<string, any>

function readOptions(source: Prop | undefined): FormElementOption[] | undefined {
  if (!source) return undefined
  if (Array.isArray(source.enum)) {
    return source.enum.map((value: unknown) => ({ label: String(value), value: String(value) }))
  }
  const variants = source.oneOf ?? source.anyOf
  if (Array.isArray(variants) && variants.every((variant: Prop) => 'const' in variant)) {
    return variants.map((variant: Prop) => ({
      label: String(variant.title ?? variant.const),
      value: String(variant.const),
    }))
  }
  return undefined
}

function detectType(prop: Prop, ui: Prop): FieldType | null {
  const widget = ui['ui:widget']
  const type = Array.isArray(prop.type) ? prop.type.find((t: string) => t !== 'null') : prop.type

  switch (type) {
    case 'boolean':
      return 'boolean'
    case 'integer':
      return widget === 'range' ? 'range' : 'integer'
    case 'number':
      return widget === 'range' ? 'range' : 'number'
    case 'array':
      return readOptions(prop.items) ? 'checkboxes' : null
    case 'string':
    case undefined: {
      if (readOptions(prop)) return widget === 'radio' ? 'radio' : 'select'
      const byFormat = (Object.entries(STRING_FORMATS) as [FieldType, string][]).find(
        ([, format]) => format === prop.format
      )
      if (byFormat) return byFormat[0]
      if (widget === 'textarea' || widget === 'password' || widget === 'color') return widget
      if (ui['ui:options']?.inputType === 'tel') return 'tel'
      return type === 'string' ? 'text' : null
    }
    default:
      return null
  }
}

const num = (value: unknown) => (typeof value === 'number' ? value : undefined)

function coerceDefault(type: FieldType, value: unknown): FieldValue | undefined {
  if (value === undefined || value === null) return undefined
  if (type === 'checkboxes') return Array.isArray(value) ? value.map(String) : undefined
  if (type === 'boolean') return Boolean(value)
  if (NUMERIC_TYPES.includes(type)) return typeof value === 'number' ? value : undefined
  return String(value)
}

/** Accepts a JSON Schema plus an optional UI Schema, or a `{ schema, uiSchema }` bundle. */
export function fromJsonSchema(input: unknown, uiInput?: unknown): ImportResult {
  let schema = input as Prop
  let uiSchema = (uiInput ?? {}) as Prop

  if (schema && typeof schema === 'object' && 'schema' in schema && !('properties' in schema)) {
    uiSchema = (schema.uiSchema as Prop) ?? uiSchema
    schema = schema.schema as Prop
  }
  if (!schema || typeof schema !== 'object' || typeof schema.properties !== 'object') {
    throw new Error('The JSON Schema needs a top-level "properties" object.')
  }

  const required: string[] = Array.isArray(schema.required) ? schema.required : []
  const order: string[] = Array.isArray(uiSchema['ui:order']) ? uiSchema['ui:order'] : []
  const names = Object.keys(schema.properties).sort((a, b) => {
    const ia = order.indexOf(a)
    const ib = order.indexOf(b)
    return (ia === -1 ? Infinity : ia) - (ib === -1 ? Infinity : ib)
  })

  const elements: FormElement[] = []
  const skipped: string[] = []

  for (const rawName of names) {
    const prop = schema.properties[rawName] as Prop
    const ui = (uiSchema[rawName] ?? {}) as Prop
    const type = prop && typeof prop === 'object' ? detectType(prop, ui) : null
    if (!type) {
      skipped.push(rawName)
      continue
    }

    const uiOptions = (ui['ui:options'] ?? {}) as Prop
    const validation: FormElementValidation = {
      required: required.includes(rawName) || undefined,
      minLength: num(prop.minLength),
      maxLength: num(prop.maxLength),
      pattern: type === 'color' ? undefined : prop.pattern,
      minimum: num(prop.minimum),
      maximum: num(prop.maximum),
      multipleOf: num(prop.multipleOf),
      minItems: num(prop.minItems),
      maxItems: num(prop.maxItems),
    }

    elements.push({
      id: createId(),
      type,
      name: sanitizeName(rawName) || uniqueName(type, elements.map((element) => element.name)),
      label: prop.title ?? rawName,
      description: prop.description,
      placeholder: ui['ui:placeholder'],
      help: ui['ui:help'],
      defaultValue: coerceDefault(type, prop.default),
      options: type === 'checkboxes' ? readOptions(prop.items) : readOptions(prop),
      validation: Object.fromEntries(
        Object.entries(validation).filter(([, value]) => value !== undefined)
      ) as FormElementValidation,
      ui: Object.fromEntries(
        Object.entries({
          hideLabel: ui['ui:label'] === false || undefined,
          disabled: ui['ui:disabled'] || undefined,
          readonly: ui['ui:readonly'] || prop.readOnly || undefined,
          autofocus: ui['ui:autofocus'] || undefined,
          inline: uiOptions.inline || undefined,
          rows: num(uiOptions.rows),
          accept: uiOptions.accept,
        }).filter(([, value]) => value !== undefined)
      ),
    })
  }

  return {
    state: {
      meta: { title: schema.title ?? '', description: schema.description ?? '' },
      elements,
    },
    skipped,
  }
}
