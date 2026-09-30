"use client"

import { useState, useRef } from "react"
import { MapPin, Search, Star, ChevronDown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LocationPickerModal } from "@/components/map/location-picker-modal"
import { useSearch } from "@/app/context/search-context"

const popular = ["Home cleaning", "AC service", "Salon", "Haircut", "Massage", "Plumbing"]

export function HeroSection() {
  const [userLocation, setUserLocation] = useState<string>("Bengaluru")
  const [inputValue, setInputValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const { triggerSearch, setSearchQuery } = useSearch()

  const handleSearch = () => {
    triggerSearch(inputValue.trim())
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch()
  }

  const handlePopularClick = (term: string) => {
    setInputValue(term)
    triggerSearch(term)
  }

  const handleClear = () => {
    setInputValue("")
    setSearchQuery("")
    inputRef.current?.focus()
  }

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-secondary via-background to-accent/40" />

      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-10 sm:px-6 md:py-16 lg:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
            <Star className="h-3.5 w-3.5 fill-current" />
            Trusted by 12M+ customers
          </span>

          <h1 className="mt-4 text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
            Quality home services, <span className="text-primary">on demand</span>
          </h1>
          <p className="mt-3 max-w-md text-pretty text-base text-muted-foreground">
            Experienced, hand-picked professionals to serve you at your doorstep. Book in seconds.
          </p>

          <div className="mt-6 rounded-2xl border border-border bg-card p-3 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row">
              {/* Location Picker */}
              <LocationPickerModal
                mode="user"
                title="Where do you need the service?"
                onLocationSelected={(displayName) => {
                  const short = displayName.split(",").slice(0, 2).join(",").trim()
                  setUserLocation(short || displayName)
                }}
                trigger={
                  <button
                    type="button"
                    className="flex items-center justify-between gap-2 rounded-xl border border-border px-3.5 py-3 text-sm font-medium sm:w-52 hover:border-primary/60 transition-colors"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <MapPin className="h-4 w-4 shrink-0 text-primary" />
                      <span className="truncate max-w-[130px]">{userLocation}</span>
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </button>
                }
              />

              {/* Search Input */}
              <div className="relative flex flex-1 items-center gap-2 rounded-xl border border-border bg-background px-3.5 py-3 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search for services..."
                  aria-label="Search for services"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                {inputValue && (
                  <button
                    type="button"
                    onClick={handleClear}
                    aria-label="Clear search"
                    className="shrink-0 rounded-full p-0.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <Button
                size="lg"
                className="rounded-xl font-semibold"
                onClick={handleSearch}
              >
                Search
              </Button>
            </div>

            {/* Popular Tags */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Popular:</span>
              {popular.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handlePopularClick(item)}
                  className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <dl className="mt-8 flex gap-8">
            {[
              ["4.8", "Avg. rating"],
              ["12M+", "Customers"],
              ["50k+", "Pros"],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="text-xl font-bold sm:text-2xl">{value}</dt>
                <dd className="text-xs text-muted-foreground">{label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-3xl border border-border shadow-lg">
            <img
              src="/images/hero-pro.png"
              alt="A professional home service expert ready to help"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-4 left-4 flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-lg sm:left-6">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Star className="h-5 w-5 fill-current" />
            </span>
            <div>
              <p className="text-sm font-semibold leading-none">Verified Pros</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Background checked</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
