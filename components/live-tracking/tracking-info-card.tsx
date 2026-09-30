"use client"

import { type TrackingSession, type TrackingStatus } from "@/app/context/tracking-context"
import {
  Car, Clock, Navigation2, Ruler, User, Hash,
  CheckCircle2, AlertCircle, Loader2, MapPin
} from "lucide-react"

const STATUS_CONFIG: Record<TrackingStatus, { label: string; color: string; dot: string }> = {
  idle:        { label: "Idle",        color: "text-muted-foreground", dot: "bg-muted-foreground" },
  searching:   { label: "Searching…",  color: "text-amber-600",        dot: "bg-amber-500 animate-pulse" },
  accepted:    { label: "Accepted",    color: "text-blue-600",          dot: "bg-blue-500" },
  on_the_way:  { label: "On the Way",  color: "text-primary",           dot: "bg-primary animate-pulse" },
  arrived:     { label: "Arrived!",    color: "text-emerald-600",       dot: "bg-emerald-500" },
  started:     { label: "Started",     color: "text-primary",           dot: "bg-primary animate-pulse" },
  completed:   { label: "Completed",   color: "text-emerald-600",       dot: "bg-emerald-500" },
  cancelled:   { label: "Cancelled",   color: "text-destructive",       dot: "bg-destructive" },
}

interface TrackingInfoCardProps {
  session: TrackingSession
  isLive: boolean
  connectionStatus: "connected" | "disconnected" | "reconnecting"
}

function timeAgo(ts: number): string {
  const sec = Math.floor((Date.now() - ts) / 1000)
  if (sec < 5) return "Just now"
  if (sec < 60) return `${sec}s ago`
  return `${Math.floor(sec / 60)}m ago`
}

export default function TrackingInfoCard({ session, isLive, connectionStatus }: TrackingInfoCardProps) {
  const cfg = STATUS_CONFIG[session.status] ?? STATUS_CONFIG.idle

  return (
    <div className="flex flex-col gap-4">

      {/* ── LIVE Indicator + Connection ─────────────────────── */}
      <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${cfg.dot}`} />
          {isLive ? (
            <span className="text-xs font-bold tracking-widest text-primary uppercase">● LIVE</span>
          ) : (
            <span className="text-xs font-medium text-muted-foreground">Not Tracking</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          {connectionStatus === "connected" && (
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" /> Connected
            </span>
          )}
          {connectionStatus === "reconnecting" && (
            <span className="flex items-center gap-1 text-amber-600 font-medium">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Reconnecting…
            </span>
          )}
          {connectionStatus === "disconnected" && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <AlertCircle className="h-3.5 w-3.5" /> Disconnected
            </span>
          )}
        </div>
      </div>

      {/* ── Status Badge ────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
          Current Status
        </p>
        <p className={`text-lg font-bold ${cfg.color}`}>{cfg.label}</p>
        {session.isDemo && (
          <span className="mt-1 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
            DEMO MODE
          </span>
        )}
      </div>

      {/* ── Stats Row ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-card px-4 py-3">
          <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
            <Ruler className="h-3.5 w-3.5" />
            <span className="text-[10px] font-semibold uppercase tracking-wider">Distance</span>
          </div>
          <p className="text-xl font-bold text-foreground">{session.distanceKm.toFixed(1)} <span className="text-sm font-medium text-muted-foreground">km</span></p>
        </div>
        <div className="rounded-2xl border border-border bg-card px-4 py-3">
          <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
            <Clock className="h-3.5 w-3.5" />
            <span className="text-[10px] font-semibold uppercase tracking-wider">ETA</span>
          </div>
          <p className="text-xl font-bold text-foreground">{session.etaMinutes} <span className="text-sm font-medium text-muted-foreground">min</span></p>
        </div>
      </div>

      {/* ── Driver / Vehicle Info ────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card px-4 py-4 space-y-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
          Professional Info
        </p>
        {[
          { icon: User,       label: "Driver",         value: session.driverName },
          { icon: Car,        label: "Vehicle",        value: session.vehicleType },
          { icon: Hash,       label: "Vehicle No.",    value: session.vehicleNumber },
          { icon: MapPin,     label: "Destination",    value: session.destinationName },
          { icon: Navigation2, label: "Tracking ID",  value: session.trackingId },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Icon className="h-3.5 w-3.5" />
              {label}
            </span>
            <span className="font-semibold text-foreground truncate max-w-[160px] text-right">
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* ── Last Updated ─────────────────────────────────────── */}
      <p className="text-center text-[11px] text-muted-foreground">
        Last updated: {timeAgo(session.lastUpdated)}
      </p>
    </div>
  )
}
