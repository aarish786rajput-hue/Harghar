"use client"

import { useState } from "react"
import Link from "next/link"
import { MapPin, Search, Menu, X, ShoppingCart, User, LogOut, Briefcase, CalendarCheck, Radio } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/app/context/auth-context"
import { HarGharLogo } from "@/components/harghar-logo"
import { useSearch } from "@/app/context/search-context"
import { ThemeToggle } from "@/components/theme-toggle"

const navLinks = [
  { label: "Home", href: "#" },
  { label: "Top Services", href: "#top-services" },
  { label: "All Services", href: "#services" },
  { label: "Search", href: "/search" },
  { label: "Bookings", href: "#booking-summary" },
  { label: "Live Tracking", href: "/live-tracking" },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const [userDropdown, setUserDropdown] = useState(false)
  const { user, userProfile, openAuthModal, logout } = useAuth()
  const { triggerSearch } = useSearch()

  const displayName = userProfile?.displayName || user?.displayName || user?.phoneNumber || "Customer"
  const userInitial = (displayName || "U").charAt(0).toUpperCase()

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <a href="#" className="flex items-center shrink-0 transition-transform hover:scale-105">
          <HarGharLogo size={36} />
        </a>

        <button
          type="button"
          className="hidden items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-foreground lg:flex"
        >
          <MapPin className="h-4 w-4 text-primary" />
          <span>Bengaluru</span>
        </button>

        <nav className="ml-2 hidden items-center gap-1 lg:flex">
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            aria-label="Search"
            onClick={() => {
              // Scroll to hero and focus its search input
              window.scrollTo({ top: 0, behavior: "smooth" })
              setTimeout(() => {
                const heroInput = document.querySelector<HTMLInputElement>("input[aria-label='Search for services']") 
                heroInput?.focus()
              }, 400)
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:hidden"
          >
            <Search className="h-5 w-5" />
          </button>
          
          <ThemeToggle />

          <button
            type="button"
            aria-label="Cart"
            onClick={() => document.getElementById("booking-summary")?.scrollIntoView({ behavior: "smooth" })}
            className="hidden h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:flex"
          >
            <ShoppingCart className="h-5 w-5" />
          </button>

          <Link
            href="/partner"
            className="hidden items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20 sm:flex"
          >
            <Briefcase className="h-3.5 w-3.5" />
            Partner Portal
          </Link>

          {/* User Auth Section (Desktop) */}
          {user ? (
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setUserDropdown((prev) => !prev)}
                className="flex items-center gap-2 rounded-full border border-border bg-card p-1.5 pr-3 text-xs font-semibold text-foreground transition-all hover:border-primary/50 hover:shadow-sm"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={displayName}
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                    {userInitial}
                  </span>
                )}
                <span className="max-w-[120px] truncate">{displayName}</span>
              </button>

              {userDropdown && (
                <div
                  className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-border bg-card p-2 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseLeave={() => setUserDropdown(false)}
                >
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-xs font-bold text-foreground truncate">{displayName}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {user.email || user.phoneNumber}
                    </p>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setUserDropdown(false)}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
                  >
                    <User className="h-3.5 w-3.5 text-primary" />
                    My Profile
                  </Link>
                  <Link
                    href="/my-bookings"
                    onClick={() => setUserDropdown(false)}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
                  >
                    <CalendarCheck className="h-3.5 w-3.5 text-primary" />
                    My Bookings
                  </Link>
                  <Link
                    href="/partner"
                    onClick={() => setUserDropdown(false)}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                  >
                    <Briefcase className="h-3.5 w-3.5" />
                    Partner Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdown(false)
                      logout()
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Button
              onClick={openAuthModal}
              className="hidden rounded-full sm:inline-flex text-xs font-semibold px-4"
            >
              <User className="h-4 w-4 mr-1" />
              Login
            </Button>
          )}

          {/* Mobile menu trigger */}
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="border-t border-border bg-background lg:hidden animate-in slide-in-from-top-2 duration-200">
          <nav className="mx-auto flex max-w-6xl flex-col px-4 py-3 sm:px-6">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                Bengaluru
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">Dark mode</span>
                <ThemeToggle />
              </div>
            </div>

            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="border-b border-border py-3 text-sm font-medium text-foreground hover:text-primary transition-colors"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            ))}

            {user && (
              <Link
                href="/my-bookings"
                className="flex items-center gap-2 border-b border-border py-3 text-sm font-semibold text-foreground hover:text-primary transition-colors"
                onClick={() => setOpen(false)}
              >
                <CalendarCheck className="h-4 w-4 text-primary" />
                My Bookings
              </Link>
            )}

            <Link
              href="/partner"
              className="flex items-center gap-2 border-b border-border py-3 text-sm font-semibold text-primary"
              onClick={() => setOpen(false)}
            >
              <Briefcase className="h-4 w-4" />
              Partner with HarGhar / Dashboard
            </Link>

            {user ? (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2.5 rounded-xl bg-secondary/50 p-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs">
                    {userInitial}
                  </span>
                  <div className="truncate text-xs">
                    <p className="font-bold text-foreground">{displayName}</p>
                    <p className="text-muted-foreground">{user.email || user.phoneNumber}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setOpen(false)
                    logout()
                  }}
                  className="w-full rounded-full text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4 mr-1.5" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => {
                  setOpen(false)
                  openAuthModal()
                }}
                className="mt-3 mb-2 w-full rounded-full"
              >
                <User className="h-4 w-4 mr-1.5" />
                Login / Register
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
