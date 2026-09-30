"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { MapPin, Navigation, Search, X, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

// Types
interface LocationResult {
  lat: number
  lng: number
  displayName: string
  area?: string
  city?: string
}

interface MapPickerProps {
  onLocationSelect?: (location: LocationResult) => void
  onClose?: () => void
  initialLocation?: { lat: number; lng: number }
  mode?: "user" | "partner"
  title?: string
}

// Nominatim reverse geocode
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { "Accept-Language": "en-IN" } }
    )
    const data = await res.json()
    const addr = data.address || {}
    const parts = [
      addr.house_number,
      addr.road || addr.pedestrian,
      addr.neighbourhood || addr.suburb,
      addr.city || addr.town || addr.village,
      addr.state,
    ].filter(Boolean)
    return parts.join(", ") || data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
  }
}

// Nominatim forward geocode (search)
async function searchLocation(query: string): Promise<LocationResult[]> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=in&addressdetails=1`,
      { headers: { "Accept-Language": "en-IN" } }
    )
    const data: Array<{
      lat: string
      lon: string
      display_name: string
      address?: { suburb?: string; city?: string; town?: string; state?: string }
    }> = await res.json()
    return data.map((item) => ({
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      displayName: item.display_name,
      area: item.address?.suburb || item.address?.city || item.address?.town,
      city: item.address?.city || item.address?.town || item.address?.state,
    }))
  } catch {
    return []
  }
}

export function MapPicker({
  onLocationSelect,
  onClose,
  initialLocation,
  mode = "user",
  title,
}: MapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<import("leaflet").Map | null>(null)
  const markerRef = useRef<import("leaflet").Marker | null>(null)

  const [selectedLocation, setSelectedLocation] = useState<LocationResult | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<LocationResult[]>([])
  const [searching, setSearching] = useState(false)
  const [locating, setLocating] = useState(false)
  const [mapReady, setMapReady] = useState(false)

  const updatePin = useCallback(async (lat: number, lng: number) => {
    if (!mapRef.current) return
    const L = (await import("leaflet")).default

    const iconUrl = `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${
      mode === "partner" ? "blue" : "red"
    }.png`

    const customIcon = L.icon({
      iconUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      shadowSize: [41, 41],
    })

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng])
    } else {
      markerRef.current = L.marker([lat, lng], { icon: customIcon, draggable: true }).addTo(
        mapRef.current
      )
      markerRef.current.on("dragend", async () => {
        const pos = markerRef.current!.getLatLng()
        const displayName = await reverseGeocode(pos.lat, pos.lng)
        setSelectedLocation({ lat: pos.lat, lng: pos.lng, displayName })
      })
    }

    mapRef.current.setView([lat, lng], 16)
    const displayName = await reverseGeocode(lat, lng)
    setSelectedLocation({ lat, lng, displayName })
  }, [mode])

  // Initialize Leaflet map
  useEffect(() => {
    let mounted = true
    async function initMap() {
      if (!mapContainerRef.current || mapRef.current) return

      const L = (await import("leaflet")).default

      // Fix default icon paths that break with bundlers
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      })

      const defaultCenter = initialLocation
        ? [initialLocation.lat, initialLocation.lng] as [number, number]
        : [12.9716, 77.5946] as [number, number] // Bengaluru center

      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: initialLocation ? 16 : 13,
        zoomControl: true,
        attributionControl: true,
      })

      // OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      // Click to place pin
      map.on("click", async (e: import("leaflet").LeafletMouseEvent) => {
        if (!mounted) return
        await updatePin(e.latlng.lat, e.latlng.lng)
      })

      mapRef.current = map

      if (initialLocation) {
        await updatePin(initialLocation.lat, initialLocation.lng)
      }

      if (mounted) setMapReady(true)
    }

    initMap()

    return () => {
      mounted = false
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        markerRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Get user's current GPS location
  const handleGPSLocate = () => {
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        await updatePin(coords.latitude, coords.longitude)
        setLocating(false)
      },
      () => {
        setLocating(false)
        alert("Could not access your location. Please enable location permissions.")
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  // Search for location
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setSearching(true)
    const results = await searchLocation(searchQuery)
    setSearchResults(results)
    setSearching(false)
  }

  const handleSelectSearchResult = async (result: LocationResult) => {
    setSearchResults([])
    setSearchQuery("")
    await updatePin(result.lat, result.lng)
  }

  const handleConfirm = () => {
    if (!selectedLocation) return
    onLocationSelect?.(selectedLocation)
    onClose?.()
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">
            {title ||
              (mode === "partner"
                ? "Set Your Service Coverage Area"
                : "Select Your Service Address")}
          </h3>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="border-b border-border px-3 py-2">
        <form onSubmit={handleSearch} className="relative flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search area, landmark, apartment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-background py-2 pl-8 pr-3 text-xs text-foreground outline-none transition-colors focus:border-primary"
            />
          </div>
          <Button type="submit" size="sm" className="rounded-xl text-xs px-3" disabled={searching}>
            {searching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Search"}
          </Button>
          <button
            type="button"
            onClick={handleGPSLocate}
            disabled={locating}
            title="Use my current location"
            className="flex items-center gap-1 rounded-xl border border-border bg-background px-3 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
          >
            {locating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Navigation className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">Live GPS</span>
          </button>
        </form>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="mt-1 max-h-40 overflow-y-auto rounded-xl border border-border bg-card shadow-lg">
            {searchResults.map((r, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSearchResult(r)}
                className="flex w-full items-start gap-2 border-b border-border/50 px-3 py-2 text-left text-xs hover:bg-secondary last:border-0"
              >
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="line-clamp-1 text-foreground">{r.displayName}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="relative flex-1 min-h-[320px]">
        {!mapReady && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-secondary/50">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        <div
          ref={mapContainerRef}
          className="h-full w-full"
          style={{ minHeight: "320px" }}
        />
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full border border-border bg-background/90 px-3 py-1 text-[10px] font-medium text-muted-foreground backdrop-blur-sm">
          Click anywhere on the map to drop a pin
        </div>
      </div>

      {/* Footer: Selected address & confirm */}
      <div className="border-t border-border bg-background p-3">
        {selectedLocation ? (
          <div className="flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <p className="flex-1 text-xs text-foreground line-clamp-2">
              {selectedLocation.displayName}
            </p>
          </div>
        ) : (
          <p className="text-center text-xs text-muted-foreground">
            No location selected — click map or search above
          </p>
        )}

        <div className="mt-2 flex gap-2">
          {onClose && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1 rounded-xl text-xs"
              onClick={onClose}
            >
              Cancel
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            className="flex-1 rounded-xl text-xs font-semibold"
            disabled={!selectedLocation}
            onClick={handleConfirm}
          >
            Confirm Location
          </Button>
        </div>
      </div>
    </div>
  )
}
