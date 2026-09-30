"use client"

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  serverTimestamp,
  addDoc,
} from "firebase/firestore"
import { db } from "@/lib/firebase"

// ─── Types ────────────────────────────────────────────────────────────────────

export type TrackingStatus =
  | "idle"
  | "searching"
  | "accepted"
  | "on_the_way"
  | "arrived"
  | "started"
  | "completed"
  | "cancelled"

export interface LocationPoint {
  latitude: number
  longitude: number
  timestamp: number
  trackingId: string
}

export interface TrackingSession {
  trackingId: string
  userId: string | null
  destinationLat: number
  destinationLng: number
  destinationName: string
  status: TrackingStatus
  driverName: string
  vehicleType: string
  vehicleNumber: string
  currentLat: number
  currentLng: number
  distanceKm: number
  etaMinutes: number
  lastUpdated: number
  isDemo: boolean
}

interface TrackingContextType {
  session: TrackingSession | null
  isLive: boolean
  connectionStatus: "connected" | "disconnected" | "reconnecting"
  startDemo: () => Promise<void>
  startReal: (destination: { lat: number; lng: number; name: string }) => Promise<void>
  stopTracking: () => Promise<void>
  sendGPSLocation: (lat: number, lng: number) => Promise<void>
}

// ─── Demo route: smooth path through Bengaluru ────────────────────────────────
const DEMO_ROUTE: Array<[number, number]> = [
  [12.9716, 77.5946],
  [12.9724, 77.5960],
  [12.9732, 77.5975],
  [12.9740, 77.5990],
  [12.9748, 77.6005],
  [12.9755, 77.6018],
  [12.9762, 77.6030],
  [12.9769, 77.6042],
  [12.9776, 77.6055],
  [12.9783, 77.6068],
  [12.9790, 77.6080],
  [12.9797, 77.6092],
  [12.9804, 77.6104],
  [12.9810, 77.6115],
  [12.9816, 77.6125],
]

const DEMO_DESTINATION: [number, number] = [12.9816, 77.6125]

function calcDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ─── Context ──────────────────────────────────────────────────────────────────

const TrackingContext = createContext<TrackingContextType | undefined>(undefined)

export function TrackingProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<TrackingSession | null>(null)
  const [isLive, setIsLive] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "reconnecting">("disconnected")

  const demoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const demoStepRef = useRef(0)
  const unsubscribeRef = useRef<(() => void) | null>(null)
  const watchIdRef = useRef<number | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (demoIntervalRef.current) clearInterval(demoIntervalRef.current)
      if (unsubscribeRef.current) unsubscribeRef.current()
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current)
    }
  }, [])

  // ── Subscribe to a tracking session in Firestore ──
  const subscribeToSession = (trackingId: string) => {
    if (unsubscribeRef.current) unsubscribeRef.current()

    setConnectionStatus("reconnecting")
    const sessionRef = doc(db, "trackingSessions", trackingId)

    const unsub = onSnapshot(
      sessionRef,
      (snap) => {
        if (snap.exists()) {
          setSession(snap.data() as TrackingSession)
          setIsLive(true)
          setConnectionStatus("connected")
        }
      },
      (err) => {
        console.warn("[Tracking] Firestore snapshot error:", err)
        setConnectionStatus("disconnected")
        setIsLive(false)
      }
    )
    unsubscribeRef.current = unsub
  }

  // ── Update session document in Firestore ──
  const updateSessionLocation = async (
    trackingId: string,
    lat: number,
    lng: number,
    destLat: number,
    destLng: number,
    status: TrackingStatus,
    extra: Partial<TrackingSession> = {}
  ) => {
    const distance = calcDistance(lat, lng, destLat, destLng)
    const eta = Math.max(1, Math.round((distance / 20) * 60)) // Approx 20 km/h avg speed

    const sessionRef = doc(db, "trackingSessions", trackingId)
    await setDoc(
      sessionRef,
      {
        currentLat: lat,
        currentLng: lng,
        distanceKm: parseFloat(distance.toFixed(2)),
        etaMinutes: eta,
        status,
        lastUpdated: Date.now(),
        ...extra,
      },
      { merge: true }
    )

    // Also write to locationHistory sub-collection
    await addDoc(collection(db, "trackingSessions", trackingId, "locationHistory"), {
      latitude: lat,
      longitude: lng,
      timestamp: Date.now(),
      trackingId,
    })
  }

  // ── START DEMO ──────────────────────────────────────────────────────────────
  const startDemo = async () => {
    if (demoIntervalRef.current) clearInterval(demoIntervalRef.current)
    demoStepRef.current = 0

    const res = await fetch("/api/tracking/start", { method: "POST" })
    const { trackingId } = await res.json()

    const [destLat, destLng] = DEMO_DESTINATION
    const startPoint = DEMO_ROUTE[0]

    const initialSession: TrackingSession = {
      trackingId,
      userId: null,
      destinationLat: destLat,
      destinationLng: destLng,
      destinationName: "MG Road, Bengaluru",
      status: "on_the_way",
      driverName: "Rahul Kumar",
      vehicleType: "Bike",
      vehicleNumber: "KA 05 AB 1234",
      currentLat: startPoint[0],
      currentLng: startPoint[1],
      distanceKm: calcDistance(startPoint[0], startPoint[1], destLat, destLng),
      etaMinutes: 12,
      lastUpdated: Date.now(),
      isDemo: true,
    }

    // Write initial session to Firestore
    const sessionRef = doc(db, "trackingSessions", trackingId)
    await setDoc(sessionRef, initialSession)

    // Subscribe to live updates
    subscribeToSession(trackingId)

    // Advance along the route every 3 seconds
    demoIntervalRef.current = setInterval(async () => {
      demoStepRef.current += 1
      if (demoStepRef.current >= DEMO_ROUTE.length) {
        clearInterval(demoIntervalRef.current!)
        await updateSessionLocation(trackingId, destLat, destLng, destLat, destLng, "arrived", {
          etaMinutes: 0,
          distanceKm: 0,
        })
        return
      }

      const [lat, lng] = DEMO_ROUTE[demoStepRef.current]
      await updateSessionLocation(trackingId, lat, lng, destLat, destLng, "on_the_way")
    }, 3000)
  }

  // ── START REAL GPS TRACKING ─────────────────────────────────────────────────
  const startReal = async (destination: { lat: number; lng: number; name: string }) => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.")
      return
    }

    const res = await fetch("/api/tracking/start", { method: "POST" })
    const { trackingId } = await res.json()

    const sessionRef = doc(db, "trackingSessions", trackingId)

    const initialSession: Partial<TrackingSession> = {
      trackingId,
      userId: null,
      destinationLat: destination.lat,
      destinationLng: destination.lng,
      destinationName: destination.name,
      status: "searching",
      driverName: "You (GPS)",
      vehicleType: "GPS Device",
      vehicleNumber: "REAL-GPS",
      currentLat: destination.lat,
      currentLng: destination.lng,
      distanceKm: 0,
      etaMinutes: 0,
      lastUpdated: Date.now(),
      isDemo: false,
    }
    await setDoc(sessionRef, initialSession)
    subscribeToSession(trackingId)

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        await updateSessionLocation(
          trackingId,
          latitude,
          longitude,
          destination.lat,
          destination.lng,
          "on_the_way"
        )
      },
      (err) => {
        console.warn("[GPS] Error:", err.message)
        setConnectionStatus("disconnected")
        alert(`GPS Error: ${err.message}`)
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
  }

  // ── STOP TRACKING ───────────────────────────────────────────────────────────
  const stopTracking = async () => {
    if (demoIntervalRef.current) clearInterval(demoIntervalRef.current)
    if (unsubscribeRef.current) unsubscribeRef.current()
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current)

    if (session?.trackingId) {
      const sessionRef = doc(db, "trackingSessions", session.trackingId)
      await setDoc(sessionRef, { status: "cancelled" }, { merge: true })
    }

    setSession(null)
    setIsLive(false)
    setConnectionStatus("disconnected")
    demoStepRef.current = 0
  }

  // ── SEND GPS (for driver mode) ──────────────────────────────────────────────
  const sendGPSLocation = async (lat: number, lng: number) => {
    if (!session) return
    await updateSessionLocation(
      session.trackingId,
      lat,
      lng,
      session.destinationLat,
      session.destinationLng,
      "on_the_way"
    )
  }

  return (
    <TrackingContext.Provider
      value={{
        session,
        isLive,
        connectionStatus,
        startDemo,
        startReal,
        stopTracking,
        sendGPSLocation,
      }}
    >
      {children}
    </TrackingContext.Provider>
  )
}

export function useTracking() {
  const ctx = useContext(TrackingContext)
  if (!ctx) throw new Error("useTracking must be used within TrackingProvider")
  return ctx
}
