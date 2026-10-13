import React, { useMemo, useState } from 'react'
import Ajv2020, { type ErrorObject } from 'ajv/dist/2020'
import addFormats from 'ajv-formats'
import { CheckCircle2, CircleAlert, RotateCcw } from 'lucide-react'
import { FieldValue, FormElement, FormState, JsonSchema } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { CodeBlock } from './CodeBlock'
import { isoToLocal, localToIso, normalizeTime } from '@/lib/dates'
import { cn } from '@/lib/utils'

interface PreviewProps {
  form: FormState
  schema: JsonSchema
}

type FormData = Record<string, FieldValue | undefined>

function createAjv() {
  const ajv = new Ajv2020({ allErrors: true, strict: false })
  addFormats(ajv)
  // Browsers' time inputs don't carry a timezone, so accept it as optional.
  ajv.addFormat('time', /^\d{2}:\d{2}:\d{2}(\.\d+)?(z|[+-]\d{2}:?\d{2})?$/i)
  ajv.addFormat('data-url', /^data:([a-z]+\/[a-z0-9.+-]+)?(;[a-z-]+=[^;,]+)*(;base64)?,/i)
  return ajv
}

const capitalize = (message = '') => message.charAt(0).toUpperCase() + message.slice(1)

function fieldErrors(errors: ErrorObject[]) {
  const byField: Record<string, string[]> = {}
  for (const error of errors) {
    const field =
      error.keyword === 'required'
        ? (error.params as { missingProperty: string }).missingProperty
        : error.instancePath.split('/')[1]
    // `oneOf` reports one `const` failure per option; a single message reads better.
    if (!field || error.keyword === 'const') continue
    const message =
      error.keyword === 'required'
        ? 'This field is required'
        : ['oneOf', 'anyOf', 'enum'].includes(error.keyword)
          ? 'Choose one of the listed options'
          : capitalize(error.message)
    const list = byField[field] ?? []
    if (!list.includes(message)) byField[field] = [...list, message]
  }
  return byField
}

export function Preview({ form, schema }: PreviewProps) {
  const [values, setValues] = useState<FormData>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [submitted, setSubmitted] = useState(false)

  const validator = useMemo(() => {
    try {
      return { validate: createAjv().compile(schema), error: null }
    } catch (error) {
      return { validate: null, error: error instanceof Error ? error.message : String(error) }
    }
  }, [schema])

  // Effective data: what the user typed, falling back to each field's default.
  const data = useMemo(() => {
    const result: Record<string, FieldValue> = {}
    for (const element of form.elements) {
      if (!element.name) continue
      const value = element.name in values ? values[element.name] : element.defaultValue
      if (value === undefined || value === '') continue
      result[element.name] = value
    }
    return result
  }, [form.elements, values])

  const errors = useMemo(() => {
    if (!validator.validate) return {}
    validator.validate(data)
    return fieldErrors(validator.validate.errors ?? [])
  }, [validator, data])

  const errorCount = Object.values(errors).reduce((sum, list) => sum + list.length, 0)

  const setValue = (name: string, value: FieldValue | undefined) => {
    setValues((prev) => ({ ...prev, [name]: value }))
    setTouched((prev) => ({ ...prev, [name]: true }))
  }

  const reset = () => {
    setValues({})
    setTouched({})
    setSubmitted(false)
  }

  if (!form.elements.length) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-sm text-muted-foreground">
        Your form will render here as you add fields.
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          setSubmitted(true)
        }}
        className="rounded-xl border bg-card p-5 shadow-sm sm:p-7"
      >
        {(form.meta.title || form.meta.description) && (
          <div className="mb-6 space-y-1">
            {form.meta.title && <h2 className="text-xl font-semibold tracking-tight">{form.meta.title}</h2>}
            {form.meta.description && <p className="text-sm text-muted-foreground">{form.meta.description}</p>}
          </div>
        )}
        <div className="space-y-5">
          {form.elements.map((element) => {
            if (!element.name) return null
            const shownErrors = touched[element.name] || submitted ? errors[element.name] : undefined
            return (
              <PreviewField
                key={element.id}
                element={element}
                value={data[element.name]}
                errors={shownErrors}
                onChange={(value) => setValue(element.name, value)}
              />
            )
          })}
        </div>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Button type="submit">Check data</Button>
          <Button type="button" variant="ghost" onClick={reset}>
            <RotateCcw className="mr-1.5 h-4 w-4" /> Reset
          </Button>
        </div>
      </form>

      <section aria-labelledby="form-data-heading" className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 id="form-data-heading" className="text-sm font-semibold">
            Form data
          </h3>
          {validator.error ? (
            <span className="flex items-center gap-1.5 text-sm text-destructive">
              <CircleAlert className="h-4 w-4" /> Schema doesn’t compile
            </span>
          ) : errorCount === 0 ? (
            <span className="flex items-center gap-1.5 text-sm text-primary">
              <CheckCircle2 className="h-4 w-4" /> Valid against the schema
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-sm text-warn">
              <CircleAlert className="h-4 w-4" /> {errorCount} {errorCount === 1 ? 'problem' : 'problems'}
            </span>
          )}
        </div>
        {validator.error && <p className="text-sm text-destructive">{validator.error}</p>}
        <CodeBlock value={data} truncateStrings />
      </section>
    </div>
  )
}

interface PreviewFieldProps {
  element: FormElement
  value: FieldValue | undefined
  errors?: string[]
  onChange: (value: FieldValue | undefined) => void
}

function PreviewField({ element, value, errors, onChange }: PreviewFieldProps) {
  const id = `preview-${element.id}`
  const { validation, ui } = element
  const disabled = ui.disabled || ui.readonly
  const describedBy = [element.help && `${id}-help`, errors?.length && `${id}-error`].filter(Boolean).join(' ') || undefined
  const invalid = Boolean(errors?.length)
  const str = typeof value === 'string' ? value : ''

  const label = (
    <Label htmlFor={id} className={cn('text-sm font-medium', ui.hideLabel && 'sr-only')}>
      {element.label}
      {validation.required && <span className="ml-0.5 text-warn">*</span>}
    </Label>
  )

  const common = {
    id,
    name: element.name,
    disabled,
    autoFocus: ui.autofocus,
    'aria-invalid': invalid || undefined,
    'aria-describedby': describedBy,
    className: cn(invalid && 'border-destructive focus-visible:ring-destructive'),
  }

  const control = (() => {
    switch (element.type) {
      case 'textarea':
        return <Textarea {...common} rows={ui.rows ?? 4} placeholder={element.placeholder} value={str} onChange={(e) => onChange(e.target.value)} />
      case 'number':
      case 'integer':
        return (
          <Input
            {...common}
            type="number"
            inputMode={element.type === 'integer' ? 'numeric' : 'decimal'}
            placeholder={element.placeholder}
            min={validation.minimum}
            max={validation.maximum}
            step={validation.multipleOf ?? (element.type === 'integer' ? 1 : 'any')}
            value={typeof value === 'number' ? value : ''}
            onChange={(e) => onChange(e.target.value === '' ? undefined : e.target.valueAsNumber)}
          />
        )
      case 'range': {
        const min = validation.minimum ?? 0
        const max = validation.maximum ?? 100
        const current = typeof value === 'number' ? value : undefined
        return (
          <div className="flex items-center gap-4">
            <input
              {...common}
              type="range"
              min={min}
              max={max}
              step={validation.multipleOf ?? 1}
              value={current ?? min}
              onChange={(e) => onChange(e.target.valueAsNumber)}
              className="h-2 flex-1 cursor-pointer accent-[hsl(var(--primary))]"
            />
            <output htmlFor={id} className="w-12 text-right font-mono text-sm tabular-nums">
              {current ?? '–'}
            </output>
          </div>
        )
      }
      case 'boolean':
        return (
          <div className="flex items-center gap-3">
            <Switch {...common} checked={value === true} onCheckedChange={(checked) => onChange(checked)} />
            <Label htmlFor={id} className="cursor-pointer text-sm font-normal">
              {element.label}
              {validation.required && <span className="ml-0.5 text-warn">*</span>}
            </Label>
          </div>
        )
      case 'select':
        return (
          <Select disabled={disabled} value={str} onValueChange={(v) => onChange(v)}>
            <SelectTrigger id={id} aria-invalid={invalid || undefined} aria-describedby={describedBy} className={common.className}>
              <SelectValue placeholder={element.placeholder || 'Choose an option'} />
            </SelectTrigger>
            <SelectContent>
              {element.options
                ?.filter((option) => option.value !== '')
                .map((option, index) => (
                  <SelectItem key={index} value={option.value}>
                    {option.label || option.value}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        )
      case 'radio':
        return (
          <RadioGroup
            disabled={disabled}
            value={str}
            onValueChange={(v) => onChange(v)}
            aria-labelledby={`${id}-legend`}
            aria-describedby={describedBy}
            className={cn(ui.inline ? 'flex flex-wrap gap-x-5 gap-y-2' : 'grid gap-2')}
          >
            {element.options?.filter((option) => option.value !== '').map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <RadioGroupItem value={option.value} id={`${id}-${index}`} />
                <Label htmlFor={`${id}-${index}`} className="cursor-pointer font-normal">
                  {option.label || option.value}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )
      case 'checkboxes': {
        const selected = Array.isArray(value) ? value : []
        return (
          <div
            role="group"
            aria-labelledby={`${id}-legend`}
            aria-describedby={describedBy}
            className={cn(ui.inline ? 'flex flex-wrap gap-x-5 gap-y-2' : 'grid gap-2')}
          >
            {element.options?.filter((option) => option.value !== '').map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <Checkbox
                  id={`${id}-${index}`}
                  disabled={disabled}
                  checked={selected.includes(option.value)}
                  onCheckedChange={(checked) =>
                    onChange(checked ? [...selected, option.value] : selected.filter((v) => v !== option.value))
                  }
                />
                <Label htmlFor={`${id}-${index}`} className="cursor-pointer font-normal">
                  {option.label || option.value}
                </Label>
              </div>
            ))}
          </div>
        )
      }
      case 'date':
        return <Input {...common} type="date" value={str} onChange={(e) => onChange(e.target.value)} />
      case 'time':
        return <Input {...common} type="time" step={1} value={str} onChange={(e) => onChange(e.target.value ? normalizeTime(e.target.value) : '')} />
      case 'datetime':
        return (
          <Input
            {...common}
            type="datetime-local"
            step={1}
            value={str ? isoToLocal(str) : ''}
            onChange={(e) => onChange(e.target.value ? localToIso(e.target.value) : '')}
          />
        )
      case 'color':
        return (
          <div className="flex items-center gap-3">
            <input
              {...common}
              type="color"
              value={str || '#000000'}
              onChange={(e) => onChange(e.target.value)}
              className="h-10 w-14 cursor-pointer rounded-md border bg-background p-1 disabled:cursor-not-allowed"
            />
            <span className="font-mono text-sm text-muted-foreground">{str || 'Not set'}</span>
          </div>
        )
      case 'file':
        return (
          <Input
            {...common}
            type="file"
            accept={ui.accept}
            className={cn('cursor-pointer file:mr-3 file:rounded file:border-0 file:bg-accent file:px-2 file:py-1 file:text-sm file:text-accent-foreground', common.className)}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (!file) return onChange(undefined)
              const reader = new FileReader()
              reader.onload = () => {
                const result = String(reader.result)
                // RJSF embeds the file name in the data URL.
                onChange(result.replace(';base64', `;name=${encodeURIComponent(file.name)};base64`))
              }
              reader.readAsDataURL(file)
            }}
          />
        )
      default: {
        const type = { email: 'email', url: 'url', password: 'password', tel: 'tel' }[element.type as string] ?? 'text'
        return (
          <Input
            {...common}
            type={type}
            placeholder={element.placeholder}
            value={str}
            onChange={(e) => onChange(e.target.value)}
          />
        )
      }
    }
  })()

  const isGroup = element.type === 'radio' || element.type === 'checkboxes'

  return (
    <div className="space-y-2">
      {element.type !== 'boolean' &&
        (isGroup ? (
          <p id={`${id}-legend`} className={cn('text-sm font-medium', ui.hideLabel && 'sr-only')}>
            {element.label}
            {validation.required && <span className="ml-0.5 text-warn">*</span>}
          </p>
        ) : (
          label
        ))}
      {element.description && <p className="text-sm text-muted-foreground">{element.description}</p>}
      {control}
      {element.help && (
        <p id={`${id}-help`} className="text-xs text-muted-foreground">
          {element.help}
        </p>
      )}
      {errors?.length ? (
        <p id={`${id}-error`} className="text-xs font-medium text-destructive">
          {errors.join('. ')}
        </p>
      ) : null}
    </div>
  )
}
