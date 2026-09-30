"use client"

import { useEffect, useRef, useState } from "react"
import type { MutableRefObject } from "react"
import type { TrackingSession } from "@/app/context/tracking-context"

interface LiveTrackingMapProps {
  session: TrackingSession
  centerFnRef?: MutableRefObject<(() => void) | null>
}

export default function LiveTrackingMap({ session, centerFnRef }: LiveTrackingMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<import("leaflet").Map | null>(null)
  const vehicleMarkerRef = useRef<import("leaflet").Marker | null>(null)
  const destMarkerRef = useRef<import("leaflet").Marker | null>(null)
  const routeLineRef = useRef<import("leaflet").Polyline | null>(null)
  const [mapReady, setMapReady] = useState(false)

  // Initialize map once
  useEffect(() => {
    let mounted = true
    async function initMap() {
      if (!mapContainerRef.current || mapRef.current) return
      const L = (await import("leaflet")).default

      // Fix bundler icon paths — same pattern as existing map-picker.tsx
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      })

      const map = L.map(mapContainerRef.current, {
        center: [session.currentLat, session.currentLng],
        zoom: 15,
        zoomControl: true,
        attributionControl: true,
      })

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      mapRef.current = map
      if (mounted) setMapReady(true)
    }
    initMap()
    return () => {
      mounted = false
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        vehicleMarkerRef.current = null
        destMarkerRef.current = null
        routeLineRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Expose center function via ref so parent can call it
  useEffect(() => {
    if (!centerFnRef) return
    centerFnRef.current = () => {
      mapRef.current?.setView([session.currentLat, session.currentLng], 16, { animate: true })
    }
  }, [session.currentLat, session.currentLng, centerFnRef])

  // Update markers + route whenever session data changes
  useEffect(() => {
    if (!mapRef.current || !mapReady) return

    const update = async () => {
      const L = (await import("leaflet")).default
      const map = mapRef.current!
      const vehicleLat = session.currentLat
      const vehicleLng = session.currentLng
      const destLat = session.destinationLat
      const destLng = session.destinationLng

      // Vehicle marker — glowing purple car emoji
      const vehicleIcon = L.divIcon({
        className: "",
        html: `<div style="
          width:42px;height:42px;
          background:linear-gradient(135deg,#7c3aed,#6d28d9);
          border:3px solid white;border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          font-size:20px;
          box-shadow:0 0 0 6px rgba(124,58,237,.25),0 4px 14px rgba(109,40,217,.5);
        ">🚗</div>`,
        iconSize: [42, 42],
        iconAnchor: [21, 21],
      })

      // Destination marker — green pin
      const destIcon = L.divIcon({
        className: "",
        html: `<div style="
          width:36px;height:36px;
          background:linear-gradient(135deg,#059669,#047857);
          border:3px solid white;border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          font-size:16px;
          box-shadow:0 4px 12px rgba(5,150,105,.45);
        ">📍</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      })

      if (vehicleMarkerRef.current) {
        vehicleMarkerRef.current.setLatLng([vehicleLat, vehicleLng])
      } else {
        vehicleMarkerRef.current = L.marker([vehicleLat, vehicleLng], { icon: vehicleIcon })
          .addTo(map)
          .bindPopup(`<b>${session.driverName}</b><br>${session.vehicleType} · ${session.vehicleNumber}`)
      }

      if (destMarkerRef.current) {
        destMarkerRef.current.setLatLng([destLat, destLng])
      } else {
        destMarkerRef.current = L.marker([destLat, destLng], { icon: destIcon })
          .addTo(map)
          .bindPopup(`<b>Destination</b><br>${session.destinationName}`)
      }

      const routePoints: [number, number][] = [[vehicleLat, vehicleLng], [destLat, destLng]]
      if (routeLineRef.current) {
        routeLineRef.current.setLatLngs(routePoints)
      } else {
        routeLineRef.current = L.polyline(routePoints, {
          color: "#7c3aed",
          weight: 4,
          opacity: 0.8,
          dashArray: "10, 6",
        }).addTo(map)
      }

      // Smooth pan if vehicle leaves viewport
      if (!map.getBounds().contains([vehicleLat, vehicleLng])) {
        map.panTo([vehicleLat, vehicleLng], { animate: true, duration: 1 })
      }
    }

    update()
  }, [session.currentLat, session.currentLng, session.destinationLat, session.destinationLng, mapReady])

  return (
    <div className="relative w-full h-full min-h-[320px]">
      {!mapReady && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-secondary/50 rounded-2xl">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-xs text-muted-foreground">Loading map…</p>
          </div>
        </div>
      )}
      <div ref={mapContainerRef} className="h-full w-full rounded-2xl overflow-hidden" style={{ minHeight: "320px" }} />
    </div>
  )
}
