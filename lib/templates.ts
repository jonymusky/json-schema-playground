import { FormElement, FormState } from '@/types'
import { createId } from './fields'

type Draft = Omit<FormElement, 'id' | 'validation' | 'ui'> &
  Partial<Pick<FormElement, 'validation' | 'ui'>>

const build = (title: string, description: string, drafts: Draft[]): FormState => ({
  meta: { title, description },
  elements: drafts.map((draft) => ({ validation: {}, ui: {}, ...draft, id: createId() })),
})

const options = (...labels: string[]) =>
  labels.map((label) => ({ label, value: label.toLowerCase().replace(/[^a-z0-9]+/g, '-') }))

export interface Template {
  id: string
  name: string
  summary: string
  create: () => FormState
}

export const TEMPLATES: Template[] = [
  {
    id: 'contact',
    name: 'Contact form',
    summary: 'Name, email, topic and message',
    create: () =>
      build('Contact us', 'We usually reply within one business day.', [
        { type: 'text', name: 'fullName', label: 'Full name', placeholder: 'Ada Lovelace', validation: { required: true, minLength: 2 } },
        { type: 'email', name: 'email', label: 'Email', placeholder: 'ada@example.com', validation: { required: true } },
        { type: 'select', name: 'topic', label: 'Topic', options: options('Sales', 'Support', 'Partnerships'), validation: { required: true } },
        { type: 'textarea', name: 'message', label: 'Message', validation: { required: true, minLength: 20, maxLength: 1000 }, ui: { rows: 5 } },
        { type: 'boolean', name: 'newsletter', label: 'Send me product updates', defaultValue: false },
      ]),
  },
  {
    id: 'signup',
    name: 'Sign-up',
    summary: 'Account details with password rules',
    create: () =>
      build('Create your account', '', [
        { type: 'text', name: 'username', label: 'Username', help: 'Lowercase letters, numbers and underscores.', validation: { required: true, minLength: 3, maxLength: 20, pattern: '^[a-z0-9_]+$' } },
        { type: 'email', name: 'email', label: 'Email', validation: { required: true } },
        { type: 'password', name: 'password', label: 'Password', help: 'At least 8 characters.', validation: { required: true, minLength: 8 } },
        { type: 'date', name: 'birthDate', label: 'Date of birth' },
        { type: 'tel', name: 'phone', label: 'Phone', placeholder: '+1 555 0100' },
        { type: 'boolean', name: 'acceptTerms', label: 'I accept the terms of service', defaultValue: false },
      ]),
  },
  {
    id: 'survey',
    name: 'Feedback survey',
    summary: 'Ratings, multiple choice and comments',
    create: () =>
      build('How did we do?', 'Takes about a minute.', [
        { type: 'range', name: 'score', label: 'How likely are you to recommend us?', defaultValue: 8, validation: { required: true, minimum: 0, maximum: 10, multipleOf: 1 } },
        { type: 'radio', name: 'frequency', label: 'How often do you use the product?', options: options('Daily', 'Weekly', 'Monthly', 'Rarely'), ui: { inline: true } },
        { type: 'checkboxes', name: 'features', label: 'Which features do you use?', options: options('Editor', 'Preview', 'Export', 'Sharing'), validation: { minItems: 1 } },
        { type: 'textarea', name: 'comments', label: 'Anything else?', ui: { rows: 3 } },
      ]),
  },
  {
    id: 'event',
    name: 'Event registration',
    summary: 'Tickets, session time and dietary needs',
    create: () =>
      build('Register for the meetup', '', [
        { type: 'text', name: 'name', label: 'Name', validation: { required: true } },
        { type: 'email', name: 'email', label: 'Email', validation: { required: true } },
        { type: 'integer', name: 'tickets', label: 'Tickets', defaultValue: 1, validation: { required: true, minimum: 1, maximum: 5 } },
        { type: 'datetime', name: 'session', label: 'Preferred session' },
        { type: 'checkboxes', name: 'diet', label: 'Dietary requirements', options: options('Vegetarian', 'Vegan', 'Gluten free'), ui: { inline: true } },
        { type: 'url', name: 'website', label: 'Website or portfolio' },
        { type: 'file', name: 'avatar', label: 'Badge photo', ui: { accept: 'image/*' } },
      ]),
  },
]

export const EMPTY_FORM: FormState = { meta: { title: '', description: '' }, elements: [] }
