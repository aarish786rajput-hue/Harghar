"use client"

import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

type BookingConfirmationProps = {
  bookingId: string
  serviceName: string
  selectedDate: string
  selectedTime: string
  fullName: string
  phone: string
  address: string
  price: number
  onReset: () => void
}

export function BookingConfirmation({
  bookingId,
  serviceName,
  selectedDate,
  selectedTime,
  fullName,
  phone,
  address,
  price,
  onReset,
}: BookingConfirmationProps) {
  return (
    <div className="my-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center">
      <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
      <h3 className="mt-3 text-lg font-bold text-foreground">
        Booking Confirmed Successfully!
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Booking ID:{" "}
        <span className="font-mono font-semibold text-primary">{bookingId}</span>
      </p>
      <div className="mx-auto mt-4 max-w-md rounded-xl bg-card p-4 text-left text-xs text-muted-foreground border border-border space-y-1.5">
        <p>
          <span className="font-semibold text-foreground">Service:</span> {serviceName}
        </p>
        <p>
          <span className="font-semibold text-foreground">Slot:</span> {selectedDate} ({selectedTime})
        </p>
        <p>
          <span className="font-semibold text-foreground">Customer:</span>{" "}
          {fullName || "Guest Customer"} ({phone || "Provided"})
        </p>
        {address && (
          <p>
            <span className="font-semibold text-foreground">Address:</span> {address}
          </p>
        )}
        <p>
          <span className="font-semibold text-foreground">Total Payable:</span> ₹
          {price} (Pay after service)
        </p>
      </div>
      <Button onClick={onReset} className="mt-6 rounded-full px-6 text-xs">
        Book Another Service
      </Button>
    </div>
  )
}
