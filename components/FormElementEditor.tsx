import React from 'react'
import { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd'
import { ChevronDown, Copy, GripVertical, Plus, Trash2, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { isoToLocal, localToIso, normalizeTime } from '@/lib/dates'
import {
  FIELD_DEFINITIONS,
  FIELD_GROUPS,
  hasOptions,
  LENGTH_TYPES,
  NUMERIC_TYPES,
  PATTERN_TYPES,
  PLACEHOLDER_TYPES,
  sanitizeName,
} from '@/lib/fields'
import { FieldType, FieldValue, FormElement, FormElementOption, FormElementUi, FormElementValidation } from '@/types'

interface FormElementEditorProps {
  element: FormElement
  expanded: boolean
  nameError?: string
  dragHandleProps: DraggableProvidedDragHandleProps | null
  isDragging: boolean
  onToggle: () => void
  onUpdate: (element: FormElement, key?: string) => void
  onDuplicate: () => void
  onDelete: () => void
}

export function FormElementEditor({
  element,
  expanded,
  nameError,
  dragHandleProps,
  isDragging,
  onToggle,
  onUpdate,
  onDuplicate,
  onDelete,
}: FormElementEditorProps) {
  const definition = FIELD_DEFINITIONS[element.type]
  const Icon = definition.icon
  const bodyId = `field-body-${element.id}`

  const set = <K extends keyof FormElement>(field: K, value: FormElement[K]) =>
    onUpdate({ ...element, [field]: value }, `${element.id}:${String(field)}`)

  const setValidation = <K extends keyof FormElementValidation>(field: K, value: FormElementValidation[K]) =>
    onUpdate({ ...element, validation: { ...element.validation, [field]: value } }, `${element.id}:v:${field}`)

  const setUi = <K extends keyof FormElementUi>(field: K, value: FormElementUi[K]) =>
    onUpdate({ ...element, ui: { ...element.ui, [field]: value } }, `${element.id}:ui:${field}`)

  const changeType = (type: FieldType) => {
    const next: FormElement = { ...element, type, defaultValue: undefined, validation: { required: element.validation.required } }
    if (hasOptions(type) && !element.options?.length) {
      next.options = [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' },
      ]
    }
    if (!hasOptions(type)) next.options = undefined
    if (type === 'range') next.validation = { ...next.validation, minimum: 0, maximum: 100, multipleOf: 1 }
    onUpdate(next)
  }

  const setOption = (index: number, field: keyof FormElementOption, value: string) => {
    const options = [...(element.options ?? [])]
    options[index] = { ...options[index], [field]: field === 'value' ? value.trim() : value }
    onUpdate({ ...element, options }, `${element.id}:option:${index}:${field}`)
  }

  const addOption = () => {
    const options = element.options ?? []
    const n = options.length + 1
    onUpdate({ ...element, options: [...options, { label: `Option ${n}`, value: `option${n}` }] })
  }

  const removeOption = (index: number) => {
    const removed = element.options?.[index]?.value
    const options = (element.options ?? []).filter((_, i) => i !== index)
    let defaultValue = element.defaultValue
    if (Array.isArray(defaultValue)) defaultValue = defaultValue.filter((value) => value !== removed)
    else if (defaultValue === removed) defaultValue = undefined
    onUpdate({ ...element, options, defaultValue })
  }

  return (
    <div
      className={cn(
        'group rounded-lg border bg-card text-card-foreground transition-shadow',
        expanded ? 'border-primary/50 shadow-md ring-1 ring-primary/20' : 'hover:border-primary/30',
        isDragging && 'shadow-xl ring-2 ring-primary/40'
      )}
    >
      <div className="flex items-center gap-1 py-2 pl-1 pr-2">
        <div
          {...dragHandleProps}
          className="flex h-8 w-6 shrink-0 cursor-grab items-center justify-center rounded text-muted-foreground/60 hover:text-foreground active:cursor-grabbing"
          aria-label={`Reorder ${element.label}`}
        >
          <GripVertical className="h-4 w-4" />
        </div>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          aria-controls={bodyId}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-md px-1 py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
            <Icon className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1 truncate text-sm font-medium">
              <span className="truncate">{element.label || 'Untitled field'}</span>
              {element.validation.required && (
                <span className="text-warn" aria-label="required">
                  *
                </span>
              )}
            </span>
            <span className={cn('block truncate font-mono text-xs', nameError ? 'text-destructive' : 'text-muted-foreground')}>
              {element.name || 'no name'} <span className="opacity-60">{definition.hint}</span>
            </span>
          </span>
          <ChevronDown className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform', expanded && 'rotate-180')} />
        </button>
        <Button variant="ghost" size="icon-sm" onClick={onDuplicate} title="Duplicate field">
          <Copy className="h-4 w-4" />
          <span className="sr-only">Duplicate {element.label}</span>
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onDelete}
          title="Delete field"
          className="hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete {element.label}</span>
        </Button>
      </div>

      {expanded && (
        <div id={bodyId} className="space-y-6 border-t px-4 pb-5 pt-4">
          <Section title="Basics">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Label" htmlFor={`${element.id}-label`}>
                <Input id={`${element.id}-label`} value={element.label} onChange={(e) => set('label', e.target.value)} />
              </Field>
              <Field label="Field name" htmlFor={`${element.id}-name`} error={nameError}>
                <Input
                  id={`${element.id}-name`}
                  value={element.name}
                  className="font-mono"
                  spellCheck={false}
                  aria-invalid={Boolean(nameError)}
                  onChange={(e) => set('name', sanitizeName(e.target.value))}
                />
              </Field>
              <Field label="Type" htmlFor={`${element.id}-type`}>
                <Select value={element.type} onValueChange={(value) => changeType(value as FieldType)}>
                  <SelectTrigger id={`${element.id}-type`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FIELD_GROUPS.map((group) => (
                      <SelectGroup key={group.title}>
                        <SelectLabel>{group.title}</SelectLabel>
                        {group.fields.map((field) => (
                          <SelectItem key={field.type} value={field.type}>
                            {field.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              {PLACEHOLDER_TYPES.includes(element.type) && (
                <Field label="Placeholder" htmlFor={`${element.id}-placeholder`}>
                  <Input
                    id={`${element.id}-placeholder`}
                    value={element.placeholder ?? ''}
                    onChange={(e) => set('placeholder', e.target.value || undefined)}
                  />
                </Field>
              )}
            </div>
            <Field label="Description" htmlFor={`${element.id}-description`} hint="Exported as the schema description.">
              <Textarea
                id={`${element.id}-description`}
                rows={2}
                value={element.description ?? ''}
                onChange={(e) => set('description', e.target.value || undefined)}
              />
            </Field>
            <Field label="Help text" htmlFor={`${element.id}-help`} hint="Shown under the input (ui:help).">
              <Input id={`${element.id}-help`} value={element.help ?? ''} onChange={(e) => set('help', e.target.value || undefined)} />
            </Field>
          </Section>

          {hasOptions(element.type) && (
            <Section title="Options">
              <div className="space-y-2">
                <div className="grid grid-cols-[1fr_1fr_2rem] gap-2 text-xs text-muted-foreground">
                  <span>Label</span>
                  <span>Value</span>
                </div>
                {element.options?.map((option, index) => (
                  <div key={index} className="grid grid-cols-[1fr_1fr_2rem] items-center gap-2">
                    <Input
                      aria-label={`Option ${index + 1} label`}
                      value={option.label}
                      onChange={(e) => setOption(index, 'label', e.target.value)}
                    />
                    <Input
                      aria-label={`Option ${index + 1} value`}
                      className="font-mono"
                      value={option.value}
                      onChange={(e) => setOption(index, 'value', e.target.value)}
                    />
                    <Button variant="ghost" size="icon-sm" onClick={() => removeOption(index)} disabled={(element.options?.length ?? 0) <= 1}>
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove option {index + 1}</span>
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Button variant="outline" size="sm" onClick={addOption}>
                  <Plus className="mr-1.5 h-4 w-4" /> Add option
                </Button>
                {(element.type === 'radio' || element.type === 'checkboxes') && (
                  <Toggle id={`${element.id}-inline`} label="Show inline" checked={element.ui.inline} onChange={(v) => setUi('inline', v || undefined)} />
                )}
              </div>
            </Section>
          )}

          <Section title="Validation">
            <Toggle
              id={`${element.id}-required`}
              label="Required"
              checked={element.validation.required}
              onChange={(v) => setValidation('required', v || undefined)}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {LENGTH_TYPES.includes(element.type) && (
                <>
                  <NumberField id={`${element.id}-minLength`} label="Min length" min={0} value={element.validation.minLength} onChange={(v) => setValidation('minLength', v)} />
                  <NumberField id={`${element.id}-maxLength`} label="Max length" min={0} value={element.validation.maxLength} onChange={(v) => setValidation('maxLength', v)} />
                </>
              )}
              {NUMERIC_TYPES.includes(element.type) && (
                <>
                  <NumberField id={`${element.id}-minimum`} label="Minimum" value={element.validation.minimum} onChange={(v) => setValidation('minimum', v)} />
                  <NumberField id={`${element.id}-maximum`} label="Maximum" value={element.validation.maximum} onChange={(v) => setValidation('maximum', v)} />
                  <NumberField id={`${element.id}-multipleOf`} label="Step (multipleOf)" min={0} value={element.validation.multipleOf} onChange={(v) => setValidation('multipleOf', v)} />
                </>
              )}
              {element.type === 'checkboxes' && (
                <>
                  <NumberField id={`${element.id}-minItems`} label="Min selected" min={0} value={element.validation.minItems} onChange={(v) => setValidation('minItems', v)} />
                  <NumberField id={`${element.id}-maxItems`} label="Max selected" min={0} value={element.validation.maxItems} onChange={(v) => setValidation('maxItems', v)} />
                </>
              )}
            </div>
            {PATTERN_TYPES.includes(element.type) && (
              <Field label="Pattern" htmlFor={`${element.id}-pattern`} hint="A regular expression the value must match." error={patternError(element.validation.pattern)}>
                <Input
                  id={`${element.id}-pattern`}
                  className="font-mono"
                  spellCheck={false}
                  placeholder="^[A-Z]{3}-\d+$"
                  value={element.validation.pattern ?? ''}
                  onChange={(e) => setValidation('pattern', e.target.value || undefined)}
                />
              </Field>
            )}
          </Section>

          <Section title="Default value">
            <DefaultValueInput element={element} onChange={(value) => set('defaultValue', value)} />
          </Section>

          <Section title="Display">
            <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              <Toggle id={`${element.id}-hideLabel`} label="Hide label" checked={element.ui.hideLabel} onChange={(v) => setUi('hideLabel', v || undefined)} />
              <Toggle id={`${element.id}-autofocus`} label="Autofocus" checked={element.ui.autofocus} onChange={(v) => setUi('autofocus', v || undefined)} />
              <Toggle id={`${element.id}-disabled`} label="Disabled" checked={element.ui.disabled} onChange={(v) => setUi('disabled', v || undefined)} />
              <Toggle id={`${element.id}-readonly`} label="Read-only" checked={element.ui.readonly} onChange={(v) => setUi('readonly', v || undefined)} />
            </div>
            {element.type === 'textarea' && (
              <NumberField id={`${element.id}-rows`} label="Rows" min={1} value={element.ui.rows} onChange={(v) => setUi('rows', v)} />
            )}
            {element.type === 'file' && (
              <Field label="Accepted files" htmlFor={`${element.id}-accept`} hint="For example image/* or .pdf,.docx">
                <Input
                  id={`${element.id}-accept`}
                  className="font-mono"
                  value={element.ui.accept ?? ''}
                  onChange={(e) => setUi('accept', e.target.value || undefined)}
                />
              </Field>
            )}
          </Section>
        </div>
      )}
    </div>
  )
}

function patternError(pattern?: string) {
  if (!pattern) return undefined
  try {
    new RegExp(pattern, 'u')
    return undefined
  } catch {
    return 'This is not a valid regular expression.'
  }
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-3">
      <legend className="mb-3 text-sm font-semibold text-foreground">{title}</legend>
      {children}
    </fieldset>
  )
}

function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string
  htmlFor: string
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor} className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : (
        hint && <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  )
}

function Toggle({ id, label, checked, onChange }: { id: string; label: string; checked?: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="flex items-center gap-2.5">
      <Switch id={id} checked={Boolean(checked)} onCheckedChange={onChange} />
      <Label htmlFor={id} className="cursor-pointer text-sm font-normal">
        {label}
      </Label>
    </div>
  )
}

function NumberField({
  id,
  label,
  value,
  min,
  onChange,
}: {
  id: string
  label: string
  value?: number
  min?: number
  onChange: (value: number | undefined) => void
}) {
  return (
    <Field label={label} htmlFor={id}>
      <Input
        id={id}
        type="number"
        inputMode="decimal"
        min={min}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' || Number.isNaN(e.target.valueAsNumber) ? undefined : e.target.valueAsNumber)}
      />
    </Field>
  )
}

function DefaultValueInput({ element, onChange }: { element: FormElement; onChange: (value: FieldValue | undefined) => void }) {
  const id = `${element.id}-default`
  const value = element.defaultValue
  const options = (element.options ?? []).filter((option) => option.value !== '')

  switch (element.type) {
    case 'boolean':
      return (
        <div className="flex items-center gap-4">
          <Toggle id={id} label={value === undefined ? 'No default' : value ? 'Checked' : 'Unchecked'} checked={value === true} onChange={(v) => onChange(v)} />
          {value !== undefined && (
            <Button variant="link" size="sm" className="h-auto px-0" onClick={() => onChange(undefined)}>
              Clear default
            </Button>
          )}
        </div>
      )
    case 'number':
    case 'integer':
    case 'range':
      return (
        <NumberField
          id={id}
          label="Initial value"
          value={typeof value === 'number' ? value : undefined}
          onChange={(v) => onChange(v)}
        />
      )
    case 'select':
    case 'radio':
      return (
        <Field label="Selected option" htmlFor={id}>
          <Select value={typeof value === 'string' ? value : '__none'} onValueChange={(v) => onChange(v === '__none' ? undefined : v)}>
            <SelectTrigger id={id}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none">No default</SelectItem>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label || option.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      )
    case 'checkboxes': {
      const selected = Array.isArray(value) ? value : []
      return (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Checked by default">
          {options.map((option) => {
            const active = selected.includes(option.value)
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => onChange(active ? selected.filter((v) => v !== option.value) : [...selected, option.value])}
                className={cn(
                  'rounded-full border px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  active ? 'border-primary bg-primary text-primary-foreground' : 'hover:border-primary/50'
                )}
              >
                {option.label || option.value}
              </button>
            )
          })}
        </div>
      )
    }
    case 'file':
      return <p className="text-sm text-muted-foreground">File fields can’t have a default value.</p>
    case 'color':
      return (
        <div className="flex items-center gap-3">
          <input
            id={id}
            type="color"
            value={typeof value === 'string' ? value : '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="h-10 w-14 cursor-pointer rounded-md border bg-background p-1"
          />
          <span className="font-mono text-sm text-muted-foreground">{typeof value === 'string' ? value : 'No default'}</span>
        </div>
      )
    default: {
      const inputType = { date: 'date', time: 'time', datetime: 'datetime-local', email: 'email', url: 'url' }[element.type as string] ?? 'text'
      return (
        <Field label="Initial value" htmlFor={id}>
          {element.type === 'textarea' ? (
            <Textarea id={id} rows={2} value={typeof value === 'string' ? value : ''} onChange={(e) => onChange(e.target.value || undefined)} />
          ) : (
            <Input
              id={id}
              type={inputType}
              step={element.type === 'time' || element.type === 'datetime' ? 1 : undefined}
              value={typeof value === 'string' ? (element.type === 'datetime' ? isoToLocal(value) : value) : ''}
              onChange={(e) => {
                const raw = e.target.value
                if (!raw) return onChange(undefined)
                onChange(element.type === 'datetime' ? localToIso(raw) : element.type === 'time' ? normalizeTime(raw) : raw)
              }}
            />
          )}
        </Field>
      )
    }
  }
}
