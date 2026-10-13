import {
  AlignLeft,
  AtSign,
  Binary,
  Calendar,
  CalendarClock,
  ChevronsUpDown,
  CircleDot,
  Clock,
  Hash,
  KeyRound,
  Link2,
  ListChecks,
  Palette,
  Paperclip,
  Phone,
  SlidersHorizontal,
  ToggleRight,
  Type,
  type LucideIcon,
} from 'lucide-react'
import { FieldType, FormElement, FormElementOption } from '@/types'

export interface FieldDefinition {
  type: FieldType
  label: string
  icon: LucideIcon
  hint: string
}

export interface FieldGroup {
  title: string
  fields: FieldDefinition[]
}

export const FIELD_GROUPS: FieldGroup[] = [
  {
    title: 'Text',
    fields: [
      { type: 'text', label: 'Short text', icon: Type, hint: 'string' },
      { type: 'textarea', label: 'Long text', icon: AlignLeft, hint: 'string · textarea' },
      { type: 'email', label: 'Email', icon: AtSign, hint: 'format: email' },
      { type: 'url', label: 'URL', icon: Link2, hint: 'format: uri' },
      { type: 'password', label: 'Password', icon: KeyRound, hint: 'string · password' },
      { type: 'tel', label: 'Phone', icon: Phone, hint: 'string · tel' },
    ],
  },
  {
    title: 'Numbers',
    fields: [
      { type: 'number', label: 'Number', icon: Hash, hint: 'number' },
      { type: 'integer', label: 'Integer', icon: Binary, hint: 'integer' },
      { type: 'range', label: 'Slider', icon: SlidersHorizontal, hint: 'number · range' },
    ],
  },
  {
    title: 'Choices',
    fields: [
      { type: 'boolean', label: 'Yes / no', icon: ToggleRight, hint: 'boolean' },
      { type: 'select', label: 'Dropdown', icon: ChevronsUpDown, hint: 'enum' },
      { type: 'radio', label: 'Radio group', icon: CircleDot, hint: 'enum · radio' },
      { type: 'checkboxes', label: 'Checkboxes', icon: ListChecks, hint: 'array of enum' },
    ],
  },
  {
    title: 'Date & time',
    fields: [
      { type: 'date', label: 'Date', icon: Calendar, hint: 'format: date' },
      { type: 'time', label: 'Time', icon: Clock, hint: 'format: time' },
      { type: 'datetime', label: 'Date & time', icon: CalendarClock, hint: 'format: date-time' },
    ],
  },
  {
    title: 'Other',
    fields: [
      { type: 'color', label: 'Color', icon: Palette, hint: 'string · color' },
      { type: 'file', label: 'File', icon: Paperclip, hint: 'format: data-url' },
    ],
  },
]

export const FIELD_DEFINITIONS: Record<FieldType, FieldDefinition> = Object.fromEntries(
  FIELD_GROUPS.flatMap((group) => group.fields).map((field) => [field.type, field])
) as Record<FieldType, FieldDefinition>

export const OPTION_TYPES: FieldType[] = ['select', 'radio', 'checkboxes']
export const LENGTH_TYPES: FieldType[] = ['text', 'textarea', 'email', 'url', 'password', 'tel']
export const PATTERN_TYPES: FieldType[] = ['text', 'textarea', 'password', 'tel']
export const NUMERIC_TYPES: FieldType[] = ['number', 'integer', 'range']
export const PLACEHOLDER_TYPES: FieldType[] = [
  'text',
  'textarea',
  'email',
  'url',
  'password',
  'tel',
  'number',
  'integer',
  'select',
]

export const hasOptions = (type: FieldType) => OPTION_TYPES.includes(type)

export const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 11)

export const sanitizeName = (name: string) => name.replace(/[^A-Za-z0-9_-]/g, '')

const toCamelCase = (label: string) =>
  label
    .toLowerCase()
    .replace(/[^a-z0-9]+(.)?/g, (_, char: string | undefined) => (char ? char.toUpperCase() : ''))
    .replace(/^[^a-z]+/, '')

export const uniqueName = (base: string, taken: string[]) => {
  const root = sanitizeName(toCamelCase(base)) || 'field'
  if (!taken.includes(root)) return root
  let counter = 2
  while (taken.includes(`${root}${counter}`)) counter++
  return `${root}${counter}`
}

const defaultOptions = (): FormElementOption[] => [
  { label: 'Option 1', value: 'option1' },
  { label: 'Option 2', value: 'option2' },
  { label: 'Option 3', value: 'option3' },
]

export function createElement(type: FieldType, takenNames: string[]): FormElement {
  const definition = FIELD_DEFINITIONS[type]
  const element: FormElement = {
    id: createId(),
    type,
    label: definition.label,
    name: uniqueName(definition.label, takenNames),
    validation: {},
    ui: {},
  }

  if (hasOptions(type)) element.options = defaultOptions()
  if (type === 'range') element.validation = { minimum: 0, maximum: 100, multipleOf: 1 }
  if (type === 'textarea') element.ui = { rows: 4 }
  if (type === 'color') element.defaultValue = '#0f766e'

  return element
}

export function duplicateElement(element: FormElement, takenNames: string[]): FormElement {
  return {
    ...structuredClone(element),
    id: createId(),
    label: `${element.label} copy`,
    name: uniqueName(`${element.name} copy`, takenNames),
  }
}
