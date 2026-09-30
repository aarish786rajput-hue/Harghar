"use client"

import { useState } from "react"
import { MapPin, X } from "lucide-react"
import dynamic from "next/dynamic"

// Dynamically import MapPicker to avoid SSR issues with Leaflet
const MapPicker = dynamic(
  () => import("@/components/map/map-picker").then((m) => m.MapPicker),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[480px] items-center justify-center rounded-3xl border border-border bg-secondary/30">
        <div className="text-center">
          <MapPin className="mx-auto h-8 w-8 animate-pulse text-primary" />
          <p className="mt-2 text-xs text-muted-foreground">Loading map...</p>
        </div>
      </div>
    ),
  }
)

interface LocationPickerModalProps {
  mode?: "user" | "partner"
  title?: string
  onLocationSelected?: (address: string, lat: number, lng: number) => void
  trigger?: React.ReactNode
}

export function LocationPickerModal({
  mode = "user",
  title,
  onLocationSelected,
  trigger,
}: LocationPickerModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleLocationSelect = (location: {
    lat: number
    lng: number
    displayName: string
  }) => {
    onLocationSelected?.(location.displayName, location.lat, location.lng)
    setIsOpen(false)
  }

  return (
    <>
      {/* Trigger Element */}
      <div onClick={() => setIsOpen(true)} className="cursor-pointer">
        {trigger || (
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <MapPin className="h-3.5 w-3.5" />
            Pick Location on Map
          </button>
        )}
      </div>

      {/* Full-screen Modal Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false)
          }}
        >
          <div className="relative flex h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl shadow-2xl">
            <MapPicker
              onLocationSelect={handleLocationSelect}
              onClose={() => setIsOpen(false)}
              mode={mode}
              title={title}
            />
          </div>
        </div>
      )}
    </>
  )
}
