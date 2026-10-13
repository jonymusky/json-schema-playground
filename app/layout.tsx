import type { Metadata, Viewport } from 'next'
import { IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google'
import { Providers } from './providers'

import './globals.css'

const sans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
})

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://json-schema-playground.jonymusky.com'),
  title: 'JSON Schema Playground',
  description:
    'Build forms visually and export JSON Schema (draft 2020-12) and RJSF-compatible UI Schema. Live preview with validation, templates, import and shareable links.',
  authors: [{ name: 'Jonathan Muszkat', url: 'https://me.jonymusky.com' }],
  openGraph: {
    title: 'JSON Schema Playground',
    description: 'Build forms visually and export JSON Schema and UI Schema.',
    url: 'https://json-schema-playground.jonymusky.com',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f4f5f7' },
    { media: '(prefers-color-scheme: dark)', color: '#0c0f1b' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${mono.variable}`}>
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
