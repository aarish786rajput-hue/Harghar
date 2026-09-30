"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/app/context/auth-context"
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { HarGharLogo } from "@/components/harghar-logo"
import { MobileNav } from "@/components/mobile-nav"
import Link from "next/link"
import { ArrowLeft, Loader2, PackageOpen, User, IndianRupee } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BookingCard, type BookingRecord } from "@/components/booking/booking-card"
import { ReviewModal } from "@/components/booking/review-modal"

export default function MyBookingsPage() {
  const { user, loading: authLoading, openAuthModal } = useAuth()
  const [bookings, setBookings] = useState<BookingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState<string | null>(null)
  const [bookingToReview, setBookingToReview] = useState<BookingRecord | null>(null)
  const [firestoreError, setFirestoreError] = useState(false)

  useEffect(() => {
    if (!user) { setLoading(false); return }

    setLoading(true)
    setFirestoreError(false)
    const q = query(
      collection(db, "bookings"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    )

    const unsub = onSnapshot(
      q,
      (snap) => {
        setBookings(snap.docs.map((d) => ({ docId: d.id, ...(d.data() as Omit<BookingRecord, "docId">) })))
        setLoading(false)
      },
      (err) => {
        console.warn("Firestore error:", err)
        setFirestoreError(true)
        setLoading(false)
      }
    )
    return () => unsub()
  }, [user])

  const handleCancel = async (docId: string, bookingId: string) => {
    if (!confirm(`Cancel booking ${bookingId}?`)) return
    setCancelling(docId)
    try {
      await updateDoc(doc(db, "bookings", docId), { status: "cancelled" })
    } catch (err) {
      console.error("Cancel error:", err)
      alert("Could not cancel. Please try again.")
    } finally {
      setCancelling(null)
    }
  }

  const handleReviewSubmit = async (rating: number, reviewText: string) => {
    if (!bookingToReview || !user) return
    await addDoc(collection(db, "reviews"), {
      bookingId: bookingToReview.bookingId,
      serviceName: bookingToReview.serviceName,
      userId: user.uid,
      userName: user.displayName || "User",
      rating,
      reviewText,
      createdAt: serverTimestamp(),
    })
    await updateDoc(doc(db, "bookings", bookingToReview.docId), { isReviewed: true })
    setBookingToReview(null)
    alert("Thank you for your review!")
  }

  // Loading auth
  if (authLoading) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  // Not logged in
  if (!user) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <PageHeader />
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <User className="h-9 w-9 text-primary" />
          </span>
          <div>
            <h2 className="text-xl font-bold text-foreground">Login Required</h2>
            <p className="mt-1 text-sm text-muted-foreground">Please login to view your booking history.</p>
          </div>
          <Button onClick={openAuthModal} className="rounded-full px-8">Login / Register</Button>
          <Link href="/" className="text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline">← Back to Home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader />
      <main className="mx-auto max-w-3xl px-4 py-8 pb-24 sm:px-6 lg:pb-8">
        {/* Title */}
        <div className="mb-6 flex items-center gap-3">
          <Link href="/" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">My Bookings</h1>
            <p className="text-xs text-muted-foreground">All your scheduled home service appointments</p>
          </div>
        </div>

        {/* Firestore error state */}
        {firestoreError && (
          <div className="mb-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            ⚠️ Could not load your bookings. Please check your internet connection and try again.
          </div>
        )}

        {/* Stats */}
        {!loading && bookings.length > 0 && (
          <div className="mb-6 grid grid-cols-3 gap-3">
            {[
              { label: "Total", value: bookings.length, color: "text-foreground", bg: "bg-secondary/40" },
              { label: "Active", value: bookings.filter((b) => b.status === "confirmed" || b.status === "in_progress").length, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Completed", value: bookings.filter((b) => b.status === "completed").length, color: "text-emerald-600", bg: "bg-emerald-50" },
            ].map((stat) => (
              <div key={stat.label} className={`rounded-2xl ${stat.bg} px-4 py-3 text-center`}>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-[11px] font-medium text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center gap-3 py-24 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Fetching your bookings...</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !firestoreError && bookings.length === 0 && (
          <div className="flex flex-col items-center gap-5 rounded-3xl border border-dashed border-border py-20 text-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
              <PackageOpen className="h-9 w-9 text-muted-foreground" />
            </span>
            <div>
              <p className="text-base font-semibold text-foreground">No bookings yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Book your first home service and it will appear here.</p>
            </div>
            <Link href="/" className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
              Explore Services
            </Link>
          </div>
        )}

        {/* Booking Cards */}
        {!loading && bookings.length > 0 && (
          <div className="space-y-4">
            {bookings.map((b) => (
              <BookingCard
                key={b.docId}
                booking={b}
                cancelling={cancelling}
                onCancel={handleCancel}
                onReview={(booking) => setBookingToReview(booking)}
              />
            ))}
          </div>
        )}

        {/* CTA */}
        {!loading && bookings.length > 0 && (
          <div className="mt-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-6 py-3 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors">
              <IndianRupee className="h-4 w-4" /> Book Another Service
            </Link>
          </div>
        )}
      </main>
      <MobileNav />

      {/* Review Modal */}
      {bookingToReview && (
        <ReviewModal
          booking={bookingToReview}
          onSubmit={handleReviewSubmit}
          onClose={() => setBookingToReview(null)}
        />
      )}
    </div>
  )
}

function PageHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="transition-transform hover:scale-105"><HarGharLogo size={34} /></Link>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">MY BOOKINGS</span>
      </div>
    </header>
  )
}
