"use client"

import { useBooking } from "@/app/context/bookingcontext"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ALL_SERVICES, CATEGORIES, type ServiceItem } from "@/components/services/services-data"
import { ServiceCard } from "@/components/services/service-card"
import { CategoryFilter } from "@/components/services/category-filter"
import { Search, SlidersHorizontal, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function SearchPage() {
  const { booking, setBooking } = useBooking()
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [maxPrice, setMaxPrice] = useState<number | "">("")
  const [minRating, setMinRating] = useState<number>(0)

  const filteredServices = ALL_SERVICES.filter((service: ServiceItem) => {
    const matchQuery =
      query.trim() === "" ||
      service.name.toLowerCase().includes(query.toLowerCase()) ||
      service.category.toLowerCase().includes(query.toLowerCase()) ||
      service.description.toLowerCase().includes(query.toLowerCase())
    const matchCategory = selectedCategory === "All" || service.category === selectedCategory
    const matchPrice = maxPrice === "" || service.price <= Number(maxPrice)
    const matchRating = service.rating >= minRating
    return matchQuery && matchCategory && matchPrice && matchRating
  })

  const handleSelect = (service: ServiceItem) => {
    setBooking({ serviceName: service.name, date: "Tomorrow", time: "10:00 AM - 12:00 PM", price: service.price })
    router.push("/#booking-summary")
  }

  const clearFilters = () => {
    setQuery("")
    setMaxPrice("")
    setMinRating(0)
    setSelectedCategory("All")
  }

  const hasFilters = query || maxPrice !== "" || minRating > 0 || selectedCategory !== "All"

  return (
    <div className="min-h-screen bg-background">
      {/* Search Header */}
      <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              className="pl-11 pr-4 h-12 rounded-full bg-secondary/20 border-border/50 text-base"
              placeholder="Search for AC service, Cleaning, Salon..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-6 lg:flex-row">

          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="rounded-2xl border border-border bg-card p-5 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-primary" /> Filters
                </h3>
                {hasFilters && (
                  <button onClick={clearFilters} className="text-xs text-primary hover:underline">
                    Clear all
                  </button>
                )}
              </div>

              {/* Category */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Category</p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                        selectedCategory === cat
                          ? "bg-primary text-primary-foreground"
                          : "border border-border text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Max Price */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Max Price (₹)</p>
                <Input
                  type="number"
                  placeholder="e.g. 1000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))}
                  className="rounded-xl"
                />
              </div>

              {/* Min Rating */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Min Rating</p>
                <div className="flex gap-2">
                  {[3, 4, 4.5].map((r) => (
                    <button
                      key={r}
                      onClick={() => setMinRating(minRating === r ? 0 : r)}
                      className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold border transition-all ${
                        minRating === r
                          ? "bg-amber-500 text-white border-amber-500"
                          : "border-border text-muted-foreground hover:border-amber-400"
                      }`}
                    >
                      {r}+ <Star className="h-3 w-3 fill-current" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">
                {query ? (
                  <>Results for <span className="text-primary">&ldquo;{query}&rdquo;</span></>
                ) : (
                  "All Services"
                )}
              </h2>
              <span className="text-sm text-muted-foreground">{filteredServices.length} services</span>
            </div>

            {filteredServices.length === 0 ? (
              <div className="text-center py-20 rounded-2xl border border-dashed border-border">
                <p className="text-lg font-semibold text-foreground">No services found</p>
                <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
                <Button onClick={clearFilters} variant="link" className="mt-2 text-primary">
                  Clear all filters
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    searchQuery={query}
                    isBooked={booking?.serviceName === service.name}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
