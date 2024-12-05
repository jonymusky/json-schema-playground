import { Providers } from "./providers"
import { Playground } from '@/components/Playground'
import { ToastProvider } from "@/components/ui/use-toast"

import './globals-out.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <Providers attribute="class" defaultTheme="system" enableSystem>
          <main className="min-h-screen">
            <ToastProvider>
              <Playground />
            </ToastProvider>
          </main>
        </Providers>
      </body>
    </html>
  )
}