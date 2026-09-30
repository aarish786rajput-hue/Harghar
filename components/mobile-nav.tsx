"use client"

import { usePathname, useRouter } from "next/navigation"
import { Home, Grid3x3, CalendarCheck, User, Radio } from "lucide-react"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { useAuth } from "@/app/context/auth-context"

type NavItem = {
  label: string
  icon: LucideIcon
  action: "home" | "services" | "bookings" | "account" | "tracking"
}

const items: NavItem[] = [
  { label: "Home", icon: Home, action: "home" },
  { label: "Services", icon: Grid3x3, action: "services" },
  { label: "Tracking", icon: Radio, action: "tracking" },
  { label: "Bookings", icon: CalendarCheck, action: "bookings" },
  { label: "Account", icon: User, action: "account" },
]

export function MobileNav() {
  const { user, openAuthModal } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  const getActive = () => {
    if (pathname === "/my-bookings") return "Bookings"
    if (pathname === "/live-tracking") return "Tracking"
    if (pathname === "/profile") return "Account"
    return "Home"
  }

  const active = getActive()

  const handleNavClick = (item: NavItem) => {
    if (item.action === "home") {
      if (pathname !== "/") router.push("/")
      else window.scrollTo({ top: 0, behavior: "smooth" })
    } else if (item.action === "services") {
      if (pathname !== "/") {
        router.push("/#services")
      } else {
        document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })
      }
    } else if (item.action === "tracking") {
      router.push("/live-tracking")
    } else if (item.action === "bookings") {
      if (!user) {
        openAuthModal()
      } else {
        router.push("/my-bookings")
      }
    } else if (item.action === "account") {
      if (!user) {
        openAuthModal()
      } else {
        router.push("/profile")
      }
    }
  }

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-md lg:hidden"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {items.map((item) => {
          const { label, icon: Icon } = item
          const isActive = active === label
          return (
            <li key={label} className="flex-1">
              <button
                type="button"
                onClick={() => handleNavClick(item)}
                aria-current={isActive ? "page" : undefined}
                className={`flex w-full flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon
                  className="h-5 w-5"
                  strokeWidth={isActive ? 2.5 : 2}
                  fill={isActive ? "currentColor" : "none"}
                  fillOpacity={isActive ? 0.15 : 0}
                />
                {label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
