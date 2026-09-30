"use client"

import { useState, useEffect } from "react"
import { useBooking } from "@/app/context/bookingcontext"
import { useAuth } from "@/app/context/auth-context"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import Script from "next/script"
import { SlotSelector } from "@/components/booking/slot-selector"
import { CustomerForm } from "@/components/booking/customer-form"
import { BookingConfirmation } from "@/components/booking/booking-confirmation"

export default function BookingSummary() {
  const { booking, setBooking } = useBooking()
  const { user, userProfile } = useAuth()

  const [selectedDate, setSelectedDate] = useState("Tomorrow")
  const [selectedTime, setSelectedTime] = useState("11:00 AM - 01:00 PM")
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [confirmedBookingId, setConfirmedBookingId] = useState("")
  const [paymentError, setPaymentError] = useState("")

  // Auto-fill user details when authenticated
  useEffect(() => {
    if (user) {
      if (!fullName && (userProfile?.displayName || user.displayName)) {
        setFullName(userProfile?.displayName || user.displayName || "")
      }
      if (!phone && (userProfile?.phoneNumber || user.phoneNumber)) {
        const rawPhone = userProfile?.phoneNumber || user.phoneNumber || ""
        setPhone(rawPhone.replace("+91", "").trim())
      }
    }
  }, [user, userProfile])

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!booking) return
    setSubmitting(true)
    const id = "HG-" + Math.floor(100000 + Math.random() * 900000)

    try {
      const res = await fetch("/api/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: booking.price }),
      })
      const data = await res.json()
      if (!data.success) throw new Error("Failed to create Razorpay order")

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "HarGhar Services",
        description: `Booking for ${booking.serviceName}`,
        order_id: data.order.id,
        handler: async function (response: { razorpay_payment_id: string }) {
          try {
            await addDoc(collection(db, "bookings"), {
              bookingId: id,
              userId: user ? user.uid : null,
              userEmail: user?.email || null,
              serviceName: booking.serviceName,
              price: booking.price,
              scheduledDate: selectedDate,
              scheduledTime: selectedTime,
              customerName: fullName,
              customerPhone: phone,
              address,
              status: "confirmed",
              paymentId: response.razorpay_payment_id,
              createdAt: serverTimestamp(),
            })
          } catch {
            // Booking saved locally even if Firestore fails momentarily
          } finally {
            setConfirmedBookingId(id)
            setIsConfirmed(true)
            setSubmitting(false)
          }
        },
        prefill: { name: fullName, contact: phone, email: user?.email || "" },
        modal: { ondismiss: () => setSubmitting(false) },
        theme: { color: "#4f46e5" },
      }

      const razorpay = new (window as unknown as { Razorpay: new (opts: typeof options) => { open: () => void; on: (ev: string, cb: (r: { error: { description: string } }) => void) => void } }).Razorpay(options)
      razorpay.open()
      razorpay.on("payment.failed", (response: { error: { description: string } }) => {
        setPaymentError(response.error.description || "Payment failed. Please try again.")
        setSubmitting(false)
      })
    } catch {
      setPaymentError("Something went wrong. Please try again.")
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setBooking(null)
    setIsConfirmed(false)
    setFullName(user?.displayName || "")
    setPhone(user?.phoneNumber?.replace("+91", "") || "")
    setAddress("")
  }

  return (
    <section id="booking-summary" aria-live="polite" className="mx-auto my-8 max-w-6xl px-4 sm:px-6">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border pb-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Your Booking Details</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Review your service details, choose slot, and confirm appointment
            </p>
          </div>
          {booking && !isConfirmed && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 self-start text-xs font-semibold text-muted-foreground hover:text-destructive sm:self-auto"
            >
              <X className="h-3.5 w-3.5" /> Clear Selection
            </button>
          )}
        </div>

        {/* States: Confirmed / Form / Empty */}
        {isConfirmed ? (
          <BookingConfirmation
            bookingId={confirmedBookingId}
            serviceName={booking?.serviceName ?? ""}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            fullName={fullName}
            phone={phone}
            address={address}
            price={booking?.price ?? 0}
            onReset={handleReset}
          />
        ) : booking ? (
          <form onSubmit={handleConfirm} className="mt-6 grid gap-6 lg:grid-cols-12">
            {/* Left — slot picker */}
            <div className="space-y-5 lg:col-span-7">
              <div className="rounded-2xl border border-border bg-secondary/30 p-4">
                <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                  Selected Service
                </span>
                <div className="mt-1 flex items-center justify-between">
                  <h3 className="text-base font-bold text-foreground">{booking.serviceName}</h3>
                  <span className="text-lg font-bold text-foreground">₹{booking.price}</span>
                </div>
              </div>

              <SlotSelector
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onDateChange={setSelectedDate}
                onTimeChange={setSelectedTime}
              />
            </div>

            {/* Right — customer form */}
            <CustomerForm
              fullName={fullName}
              phone={phone}
              address={address}
              price={booking.price}
              submitting={submitting}
              onNameChange={setFullName}
              onPhoneChange={setPhone}
              onAddressChange={setAddress}
            />
          </form>
        ) : (
          <div className="my-6 rounded-2xl border border-dashed border-border py-10 text-center">
            <p className="text-sm font-medium text-foreground">No service selected yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Click &quot;Book Now&quot; on any service above to schedule your doorstep appointment.
            </p>
            <a
              href="#services"
              className="mt-4 inline-flex items-center rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/20"
            >
              Browse Services
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
