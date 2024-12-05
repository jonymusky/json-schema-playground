"use client"

import React, { createContext, useContext, useState } from "react"
import { cn } from "@/lib/utils" // Ensure this utility is implemented
import { X } from "lucide-react"

// Toast context types
interface Toast {
  id: string
  title: string
  description: string
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

// Toast provider
export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = (newToast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9) // Generate a random ID
    setToasts((prev) => [...prev, { id, ...newToast }])
    setTimeout(() => removeToast(id), 5000) // Auto-dismiss after 5 seconds
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2">
        {toasts.map(({ id, title, description, variant = "default" }) => (
          <div
            key={id}
            className={cn(
              "relative flex items-start p-4 rounded-md shadow-lg",
              variant === "destructive"
                ? "bg-red-600 text-white"
                : "bg-gray-800 text-white"
            )}
          >
            <div className="flex-1">
              <h4 className="text-sm font-semibold">{title}</h4>
              <p className="text-sm">{description}</p>
            </div>
            <button
              onClick={() => removeToast(id)}
              className="absolute top-2 right-2 text-white hover:text-gray-300 focus:outline-none"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}