"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/app/context/auth-context"
import { useRouter } from "next/navigation"
import { db } from "@/lib/firebase"
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Loader2, CheckCircle, XCircle, Clock,
  IndianRupee, Briefcase, ArrowLeft, AlertCircle
} from "lucide-react"
import Link from "next/link"
import { HarGharLogo } from "@/components/harghar-logo"

type PartnerBooking = {
  id: string
  serviceName?: string
  address?: { tag?: string }
  totalAmount?: number
  status: "pending" | "accepted" | "rejected" | "completed"
  scheduledDate?: string
  scheduledTime?: string
}

export default function PartnerDashboard() {
  const { user, userProfile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState<PartnerBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Auth + Partner guard
  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push("/?loginRequired=true"); return }
    if (userProfile && !userProfile.isPartner && !userProfile.isAdmin) {
      router.push("/partner"); return
    }
  }, [user, userProfile, authLoading, router])

  // Real-time bookings feed
  useEffect(() => {
    if (!user?.uid) return
    const q = query(
      collection(db, "bookings"),
      where("status", "in", ["pending", "accepted", "completed"])
    )
    const unsub = onSnapshot(q, (snap) => {
      setBookings(snap.docs.map((d) => ({ id: d.id, ...d.data() } as PartnerBooking)))
      setLoading(false)
    }, () => setLoading(false))
    return () => unsub()
  }, [user])

  const handleAction = async (bookingId: string, action: "accepted" | "rejected") => {
    setActionLoading(bookingId + action)
    try {
      await updateDoc(doc(db, "bookings", bookingId), {
        status: action,
        ...(action === "accepted" ? { partnerId: user?.uid } : {}),
      })
    } finally {
      setActionLoading(null)
    }
  }

  const completedEarnings = bookings
    .filter((b) => b.status === "completed")
    .reduce((acc, b) => acc + (b.totalAmount || 0), 0)

  const completedCount = bookings.filter((b) => b.status === "completed").length
  const pendingCount = bookings.filter((b) => b.status === "pending").length

  if (authLoading || (loading && user)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Link href="/" className="transition-transform hover:scale-105"><HarGharLogo size={34} /></Link>
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold text-foreground">Partner Dashboard</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex items-center gap-3">
          <Link href="/" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Partner Dashboard</h1>
            <p className="text-xs text-muted-foreground">Manage your jobs and track earnings</p>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Total Earnings", value: `₹${completedEarnings.toLocaleString("en-IN")}`, icon: IndianRupee, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Completed Jobs", value: completedCount, icon: CheckCircle, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Pending Requests", value: pendingCount, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          ].map((stat) => (
            <Card key={stat.label} className="rounded-2xl border-border">
              <CardHeader className="pb-1 pt-4">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full ${stat.bg}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </span>
                  {stat.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Job Requests */}
        <h2 className="mb-4 text-lg font-bold">Job Requests</h2>

        {bookings.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border py-20 text-center">
            <AlertCircle className="h-10 w-10 text-muted-foreground/50" />
            <div>
              <p className="font-semibold text-foreground">No jobs available right now</p>
              <p className="mt-1 text-sm text-muted-foreground">New booking requests will appear here in real time.</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bookings.map((job) => (
              <Card key={job.id} className="rounded-2xl border-border">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base leading-snug">{job.serviceName || "Service Request"}</CardTitle>
                    <StatusBadge status={job.status} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>📍 {job.address?.tag || "Location not set"}</p>
                    {job.scheduledDate && <p>📅 {job.scheduledDate} · {job.scheduledTime}</p>}
                  </div>
                  <p className="text-lg font-bold text-primary">₹{job.totalAmount?.toLocaleString("en-IN") || "TBD"}</p>

                  {job.status === "pending" && (
                    <div className="flex gap-2 pt-1">
                      <Button
                        size="sm"
                        className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700"
                        disabled={!!actionLoading}
                        onClick={() => handleAction(job.id, "accepted")}
                      >
                        {actionLoading === job.id + "accepted" ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CheckCircle className="mr-1 h-4 w-4" /> Accept</>}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1 rounded-xl"
                        disabled={!!actionLoading}
                        onClick={() => handleAction(job.id, "rejected")}
                      >
                        {actionLoading === job.id + "rejected" ? <Loader2 className="h-4 w-4 animate-spin" /> : <><XCircle className="mr-1 h-4 w-4" /> Reject</>}
                      </Button>
                    </div>
                  )}
                  {job.status === "accepted" && (
                    <Button disabled variant="outline" size="sm" className="w-full rounded-xl">
                      <CheckCircle className="mr-2 h-4 w-4 text-emerald-500" /> Accepted
                    </Button>
                  )}
                  {job.status === "completed" && (
                    <Button disabled variant="outline" size="sm" className="w-full rounded-xl">
                      <CheckCircle className="mr-2 h-4 w-4 text-blue-500" /> Completed
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function StatusBadge({ status }: { status: PartnerBooking["status"] }) {
  const config = {
    pending: { label: "Pending", cls: "bg-amber-100 text-amber-700" },
    accepted: { label: "Accepted", cls: "bg-blue-100 text-blue-700" },
    rejected: { label: "Rejected", cls: "bg-red-100 text-red-600" },
    completed: { label: "Done", cls: "bg-emerald-100 text-emerald-700" },
  }
  const { label, cls } = config[status] ?? config.pending
  return <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${cls}`}>{label}</span>
}
