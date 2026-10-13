"use client"

import React, { createContext, useCallback, useContext, useState } from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

interface Toast {
  id: string
  title: string
  description?: string
  variant?: "default" | "destructive"
}

interface ToastContextProps {
  toast: (toast: Omit<Toast, "id">) => void
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const toast = useCallback(
    (newToast: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).substring(2, 9)
      setToasts((prev) => [...prev.slice(-2), { id, ...newToast }])
      setTimeout(() => removeToast(id), 4000)
    },
    [removeToast]
  )

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed bottom-14 right-4 z-50 flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2">
        {toasts.map(({ id, title, description, variant = "default" }) => (
          <div
            key={id}
            role="status"
            className={cn(
              "pointer-events-auto relative rounded-lg border bg-popover py-3 pl-4 pr-10 text-popover-foreground shadow-lg animate-in fade-in slide-in-from-bottom-2",
              variant === "destructive" && "border-destructive/50"
            )}
          >
            <p className={cn("text-sm font-semibold", variant === "destructive" && "text-destructive")}>{title}</p>
            {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
            <button
              onClick={() => removeToast(id)}
              className="absolute right-2 top-2 rounded p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Dismiss</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
