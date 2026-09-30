"use client"

import { useRef, useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useTracking } from "@/app/context/tracking-context"
import TrackingInfoCard from "@/components/live-tracking/tracking-info-card"
import { HarGharLogo } from "@/components/harghar-logo"
import { MobileNav } from "@/components/mobile-nav"
import {
  Square, Navigation2, Loader2, ArrowLeft,
  Radio, MapPin, Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"

const LiveTrackingMap = dynamic(() => import("@/components/live-tracking/tracking-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[320px] items-center justify-center rounded-2xl bg-secondary/40">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground">Initializing map…</p>
      </div>
    </div>
  ),
})

export default function LiveTrackingPage() {
  const { session, isLive, connectionStatus, startDemo, startReal, stopTracking } = useTracking()
  const [starting, setStarting] = useState<"demo" | "gps" | null>(null)
  const centerFnRef = useRef<(() => void) | null>(null)

  const handleStartDemo = async () => {
    setStarting("demo")
    try { await startDemo() } finally { setStarting(null) }
  }

  const handleStartGPS = async () => {
    setStarting("gps")
    try {
      await startReal({ lat: 12.9758, lng: 77.6014, name: "MG Road, Bengaluru" })
    } finally { setStarting(null) }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <Link href="/" className="transition-transform hover:scale-105">
              <HarGharLogo size={32} />
            </Link>
          </div>
          <div className="flex items-center gap-2">
            {isLive && (
              <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                <Radio className="h-3.5 w-3.5 animate-pulse" /> LIVE
              </span>
            )}
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-muted-foreground">
              LIVE TRACKING
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 pb-28 sm:px-6 lg:pb-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Live Tracking</h1>
          <p className="mt-1 text-sm text-muted-foreground">Real-time location of your HarGhar professional</p>
        </div>

        {/* No Session: Start Screen */}
        {!session && (
          <div className="flex flex-col items-center gap-6 rounded-3xl border border-dashed border-border py-16 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Navigation2 className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">No Active Tracking</h2>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Start a demo to see live tracking in action, or use Real GPS to track an actual location.
              </p>
            </div>
            <div className="flex w-full max-w-sm flex-col gap-3 px-4">
              <Button
                onClick={handleStartDemo}
                disabled={starting !== null}
                className="w-full rounded-2xl py-5 text-sm font-semibold"
              >
                {starting === "demo"
                  ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  : <Zap className="mr-2 h-4 w-4" />}
                Start Demo Tracking
              </Button>
              <Button
                variant="outline"
                onClick={handleStartGPS}
                disabled={starting !== null}
                className="w-full rounded-2xl py-5 text-sm font-semibold"
              >
                {starting === "gps"
                  ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  : <MapPin className="mr-2 h-4 w-4" />}
                Use Real GPS
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground px-6">
              Demo mode moves a vehicle automatically along a route in Bengaluru every 3 seconds.
            </p>
          </div>
        )}

        {/* Active Tracking View */}
        {session && (
          <div className="grid gap-5 lg:grid-cols-12">
            <div
              className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm lg:col-span-8"
              style={{ minHeight: "420px", height: "520px" }}
            >
              <LiveTrackingMap session={session} centerFnRef={centerFnRef} />
            </div>

            <div className="flex flex-col gap-4 lg:col-span-4">
              <TrackingInfoCard session={session} isLive={isLive} connectionStatus={connectionStatus} />
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  onClick={() => centerFnRef.current?.()}
                  className="w-full rounded-2xl py-4 text-sm font-semibold"
                >
                  <Navigation2 className="mr-2 h-4 w-4" /> Center Vehicle
                </Button>
                <Button variant="destructive" onClick={stopTracking} className="w-full rounded-2xl py-4 text-sm font-semibold">
                  <Square className="mr-2 h-4 w-4" /> Stop Tracking
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Bottom Sheet */}
        {session && (
          <div className="fixed inset-x-0 bottom-0 z-30 lg:hidden">
            <div className="rounded-t-3xl border-t border-border bg-background/95 px-4 pt-3 pb-24 shadow-2xl backdrop-blur-md">
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${session.status === "on_the_way" ? "bg-primary animate-pulse" : "bg-muted-foreground"}`} />
                    <span className="text-sm font-bold text-foreground capitalize">
                      {session.status.replace("_", " ")}
                    </span>
                    {session.isDemo && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold text-amber-700">DEMO</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {session.distanceKm.toFixed(1)} km · ETA {session.etaMinutes} min · {session.driverName}
                  </p>
                </div>
                <Button size="sm" variant="destructive" onClick={stopTracking} className="rounded-xl text-xs">
                  <Square className="mr-1 h-3 w-3" /> Stop
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      <MobileNav />
    </div>
  )
}
