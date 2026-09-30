"use client"

import { useTheme } from "@/app/context/theme-context"
import { Sun, Moon } from "lucide-react"

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={`relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground ${className}`}
    >
      {/* Sun icon — visible in light mode */}
      <Sun
        className="absolute h-[18px] w-[18px] transition-all duration-300"
        style={{
          transform: isDark ? "translateY(-120%) rotate(-90deg)" : "translateY(0) rotate(0deg)",
          opacity: isDark ? 0 : 1,
        }}
      />
      {/* Moon icon — visible in dark mode */}
      <Moon
        className="absolute h-[18px] w-[18px] transition-all duration-300"
        style={{
          transform: isDark ? "translateY(0) rotate(0deg)" : "translateY(120%) rotate(90deg)",
          opacity: isDark ? 1 : 0,
        }}
      />
    </button>
  )
}
