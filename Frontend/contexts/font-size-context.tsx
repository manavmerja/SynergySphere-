"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type FontSize = "small" | "medium" | "large"

interface FontSizeContextType {
  fontSize: FontSize
  setFontSize: (size: FontSize) => void
}

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined)

export function FontSizeProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSize] = useState<FontSize>("medium")

  useEffect(() => {
    const stored = localStorage.getItem("fontSize") as FontSize
    if (stored && ["small", "medium", "large"].includes(stored)) {
      setFontSize(stored)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("fontSize", fontSize)

    // Apply font size class to document
    document.documentElement.classList.remove("font-small", "font-medium", "font-large")
    document.documentElement.classList.add(`font-${fontSize}`)
  }, [fontSize])

  return <FontSizeContext.Provider value={{ fontSize, setFontSize }}>{children}</FontSizeContext.Provider>
}

export function useFontSize() {
  const context = useContext(FontSizeContext)
  if (context === undefined) {
    throw new Error("useFontSize must be used within a FontSizeProvider")
  }
  return context
}
