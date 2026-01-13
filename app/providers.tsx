"use client"

import { ThemeProvider, type ThemeProviderProps } from "next-themes"
import { DragDropContext } from "@hello-pangea/dnd"

interface ProvidersProps extends Omit<ThemeProviderProps, 'children'> {
  children: React.ReactNode
}

export function Providers({ children, attribute, defaultTheme, enableSystem }: ProvidersProps) {
  const onDragEnd = (result: any) => {
    // Handle drag end logic here
    if (!result.destination) return
    
    // You can implement your drag and drop logic here
    console.log(result)
  }

  return (
    <ThemeProvider attribute={attribute} defaultTheme={defaultTheme} enableSystem={enableSystem}>
      <DragDropContext onDragEnd={onDragEnd}>
        {children}
      </DragDropContext>
    </ThemeProvider>
  )
}

