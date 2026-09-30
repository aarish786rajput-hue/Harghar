"use client"

import { useState, useMemo } from "react"
import { Sparkles, SearchX } from "lucide-react"
import { useBooking } from "@/app/context/bookingcontext"
import { useSearch } from "@/app/context/search-context"
import { ALL_SERVICES, type ServiceItem } from "@/components/services/services-data"
import { CategoryFilter } from "@/components/services/category-filter"
import { ServiceCard } from "@/components/services/service-card"

export default function ServicesList() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const { booking, setBooking } = useBooking()
  const { searchQuery, setSearchQuery } = useSearch()

  const filteredServices = useMemo(() => {
    let list = ALL_SERVICES
    if (selectedCategory !== "All") {
      list = list.filter((s) => s.category === selectedCategory)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q)
      )
    }
    return list
  }, [selectedCategory, searchQuery])

  const handleSelectService = (service: ServiceItem) => {
    setBooking({ serviceName: service.name, date: "Tomorrow", time: "10:00 AM - 12:00 PM", price: service.price })
    const elem = document.getElementById("booking-summary")
    if (elem) elem.scrollIntoView({ behavior: "smooth", block: "center" })
  }

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat)
    if (searchQuery) setSearchQuery("")
  }

  const handleClearSearch = () => {
    setSearchQuery("")
    setSelectedCategory("All")
  }

  const isSearchActive = searchQuery.trim().length > 0

  return (
    <section id="services" className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Explore Catalog
          </span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            {isSearchActive ? (
              <>Results for <span className="text-primary">&ldquo;{searchQuery}&rdquo;</span></>
            ) : (
              "Complete Home Services"
            )}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {isSearchActive
              ? `${filteredServices.length} service${filteredServices.length !== 1 ? "s" : ""} found`
              : "Transparent pricing, background-verified professionals & free rescheduling."}
          </p>
        </div>
        {isSearchActive && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="shrink-0 self-start rounded-full border border-border px-4 py-1.5 text-xs font-semibold text-muted-foreground hover:border-primary hover:text-primary transition-colors md:self-end"
          >
            ✕ Clear search
          </button>
        )}
      </div>

      {/* Category Filter Pills */}
      <CategoryFilter selectedCategory={selectedCategory} onCategoryChange={handleCategoryChange} />

      {/* Service Cards Grid or Empty State */}
      {filteredServices.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
            <SearchX className="h-9 w-9 text-muted-foreground" />
          </span>
          <div>
            <p className="text-lg font-semibold text-foreground">No services found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a different search term or browse all categories.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClearSearch}
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Show all services
          </button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              searchQuery={searchQuery}
              isBooked={booking?.serviceName === service.name}
              onSelect={handleSelectService}
            />
          ))}
        </div>
      )}
    </section>
  )
}