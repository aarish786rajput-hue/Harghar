"use client"

import { Loader2, CalendarCheck, Clock, MapPin, Phone, User, ChevronRight, AlertCircle, Star, RefreshCw, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

type BookingRecord = {
  docId: string
  bookingId: string
  serviceName: string
  price: number
  scheduledDate: string
  scheduledTime: string
  customerName: string
  customerPhone: string
  address: string
  status: "confirmed" | "in_progress" | "completed" | "cancelled"
  isReviewed?: boolean
  createdAt: { seconds: number } | null
}

const STATUS_CONFIG = {
  confirmed: { label: "Confirmed", color: "text-blue-600 bg-blue-50 border-blue-200", icon: CheckCircle2, dot: "bg-blue-500" },
  in_progress: { label: "In Progress", color: "text-amber-600 bg-amber-50 border-amber-200", icon: RefreshCw, dot: "bg-amber-500 animate-pulse" },
  completed: { label: "Completed", color: "text-emerald-600 bg-emerald-50 border-emerald-200", icon: CheckCircle2, dot: "bg-emerald-500" },
  cancelled: { label: "Cancelled", color: "text-red-600 bg-red-50 border-red-200", icon: XCircle, dot: "bg-red-400" },
} as const

function formatDate(ts: { seconds: number } | null) {
  if (!ts) return ""
  return new Date(ts.seconds * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

type BookingCardProps = {
  booking: BookingRecord
  cancelling: string | null
  onCancel: (docId: string, bookingId: string) => void
  onReview: (booking: BookingRecord) => void
}

export function BookingCard({ booking: b, cancelling, onCancel, onReview }: BookingCardProps) {
  const cfg = STATUS_CONFIG[b.status] ?? STATUS_CONFIG.confirmed
  const StatusIcon = cfg.icon
  const canCancel = b.status === "confirmed"

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-border bg-secondary/20 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${cfg.color}`}>
            <StatusIcon className="h-3 w-3" />
            {cfg.label}
          </span>
        </div>
        <span className="font-mono text-[11px] font-semibold text-muted-foreground">{b.bookingId}</span>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-bold text-foreground leading-snug">{b.serviceName}</h3>
          <span className="shrink-0 text-lg font-bold text-foreground">₹{b.price}</span>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-muted-foreground sm:grid-cols-2">
          <div className="flex items-center gap-2"><CalendarCheck className="h-3.5 w-3.5 shrink-0 text-primary" /><span>{b.scheduledDate}</span></div>
          <div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 shrink-0 text-primary" /><span>{b.scheduledTime}</span></div>
          {b.customerName && <div className="flex items-center gap-2"><User className="h-3.5 w-3.5 shrink-0 text-primary" /><span>{b.customerName}</span></div>}
          {b.customerPhone && <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 shrink-0 text-primary" /><span>{b.customerPhone}</span></div>}
          {b.address && <div className="col-span-full flex items-start gap-2"><MapPin className="h-3.5 w-3.5 shrink-0 text-primary mt-0.5" /><span className="line-clamp-2">{b.address}</span></div>}
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <span className="text-[11px] text-muted-foreground">{b.createdAt ? `Booked on ${formatDate(b.createdAt)}` : ""}</span>
          <div className="flex items-center gap-2">
            {canCancel && (
              <button
                type="button"
                disabled={cancelling === b.docId}
                onClick={() => onCancel(b.docId, b.bookingId)}
                className="rounded-full border border-destructive/30 px-3 py-1 text-[11px] font-semibold text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
              >
                {cancelling === b.docId ? <Loader2 className="h-3 w-3 animate-spin" /> : "Cancel"}
              </button>
            )}
            {b.status === "completed" && (
              <div className="flex items-center gap-2">
                {!b.isReviewed && (
                  <button
                    onClick={() => onReview(b)}
                    className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold text-amber-700 hover:bg-amber-200 transition-colors"
                  >
                    <Star className="h-3 w-3 fill-current" /> Rate
                  </button>
                )}
                <Link href="/" className="flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-[11px] font-semibold text-primary hover:bg-primary/10 transition-colors">
                  Book Again <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            )}
            {b.status === "cancelled" && (
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <AlertCircle className="h-3 w-3" /> Refund in 5–7 days
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

export type { BookingRecord }
