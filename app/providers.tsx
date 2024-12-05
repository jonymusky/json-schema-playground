"use client"

import { ThemeProvider } from "next-themes"
import { DragDropContext } from "@hello-pangea/dnd"

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const onDragEnd = (result: any) => {
    // Handle drag end logic here
    if (!result.destination) return
    
    // You can implement your drag and drop logic here
    console.log(result)
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <DragDropContext onDragEnd={onDragEnd}>
        {children}
      </DragDropContext>
    </ThemeProvider>
  )
}

