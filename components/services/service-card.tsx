"use client"

import { Star, Clock, Plus, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HighlightText } from "./highlight-text"
import type { ServiceItem } from "./services-data"

type ServiceCardProps = {
  service: ServiceItem
  searchQuery: string
  isBooked: boolean
  onSelect: (service: ServiceItem) => void
}

export function ServiceCard({ service, searchQuery, isBooked, onSelect }: ServiceCardProps) {
  return (
    <div
      className={`flex flex-col justify-between rounded-2xl border p-5 transition-all ${
        isBooked
          ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary"
          : "border-border bg-card hover:border-primary/30 hover:shadow-sm"
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-md bg-secondary px-2.5 py-0.5 text-[11px] font-semibold text-secondary-foreground">
            <HighlightText text={service.category} query={searchQuery} />
          </span>
          {service.popular && (
            <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-600">
              Popular
            </span>
          )}
        </div>

        <h3 className="mt-3 text-base font-semibold text-foreground">
          <HighlightText text={service.name} query={searchQuery} />
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          <HighlightText text={service.description} query={searchQuery} />
        </p>

        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1 font-medium text-foreground">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {service.rating}
          </span>
          <span>({service.reviews.toLocaleString()})</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {service.duration}
          </span>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border pt-3">
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-bold text-foreground">₹{service.price}</span>
          {service.oldPrice && (
            <span className="text-xs text-muted-foreground line-through">₹{service.oldPrice}</span>
          )}
        </div>
        <Button
          size="sm"
          variant={isBooked ? "default" : "outline"}
          className="rounded-xl px-4 text-xs font-semibold"
          onClick={() => onSelect(service)}
        >
          {isBooked ? (
            <><Check className="mr-1 h-3.5 w-3.5" /> Selected</>
          ) : (
            <><Plus className="mr-1 h-3.5 w-3.5" /> Book Now</>
          )}
        </Button>
      </div>
    </div>
  )
}
