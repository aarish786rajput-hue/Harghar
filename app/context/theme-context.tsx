"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

type Theme = "light" | "dark" | "system"

type ThemeContextValue = {
  theme: Theme
  resolvedTheme: "light" | "dark"
  setTheme: (t: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  const resolved = theme === "system" ? getSystemTheme() : theme
  root.classList.remove("light", "dark")
  root.classList.add(resolved)
  return resolved
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light")
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Read saved preference (or default to light)
    const saved = (localStorage.getItem("hg-theme") as Theme) ?? "light"
    setThemeState(saved)
    const resolved = applyTheme(saved)
    setResolvedTheme(resolved)
    setMounted(true)

    // Listen for system theme changes when using "system"
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = () => {
      if (saved === "system") {
        const r = applyTheme("system")
        setResolvedTheme(r)
      }
    }
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  const setTheme = (t: Theme) => {
    setThemeState(t)
    localStorage.setItem("hg-theme", t)
    const resolved = applyTheme(t)
    setResolvedTheme(resolved)
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  // Prevent flash of wrong theme — render children only after mount
  if (!mounted) return <>{children}</>

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  // During SSR / static prerendering the provider is not yet mounted — return safe defaults
  if (!ctx) {
    return {
      theme: "light" as const,
      resolvedTheme: "light" as const,
      setTheme: () => {},
      toggleTheme: () => {},
    }
  }
  return ctx
}
