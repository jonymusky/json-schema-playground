# JSON Schema Playground

Build forms visually and export a **JSON Schema (draft 2020-12)** plus a **UI Schema** compatible with
[react-jsonschema-form](https://rjsf-team.github.io/react-jsonschema-form/).

👉 **[json-schema-playground.jonymusky.com](https://json-schema-playground.jonymusky.com)**

## Features

- **18 field types**: short/long text, email, URL, password, phone, number, integer, slider, yes/no,
  dropdown, radio group, checkboxes (multi-select), date, time, date & time, color and file.
- **Drag and drop** fields from the palette, reorder them, duplicate them or change their type.
- **Per-field settings**: label, name, description, placeholder, help text, default value, options
  with separate labels and values, and display flags (hide label, disabled, read-only, autofocus).
- **Validation rules**: required, min/max length, regex pattern, minimum/maximum/step, min/max selected.
- **Live preview with real validation** using [Ajv](https://ajv.js.org/) against the generated schema,
  plus the resulting form data.
- **Export**: copy or download the JSON Schema and UI Schema.
- **Import**: paste or load a JSON Schema (UI Schema optional, or a `{ schema, uiSchema }` bundle).
  Exports re-import without losing anything.
- **Templates** to get started: contact form, sign-up, feedback survey and event registration.
- **Share links**: the whole form is compressed into the URL, so there's no backend.
- **Autosave** to your browser, **undo/redo** (⌘Z / ⇧⌘Z), and **light/dark** themes.

## Development

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint
npm run typecheck
npm run build      # static export to ./out
```

Built with Next.js 16 (static export), React 19, Tailwind CSS, Radix UI and @hello-pangea/dnd.
Every push to `main` deploys to GitHub Pages through `.github/workflows/nextjs.yml`.

## Author

Made by [Jonathan Muszkat](https://me.jonymusky.com).
