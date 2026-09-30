"use client"

import { useState } from "react"
import { Star, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { BookingRecord } from "./booking-card"

type ReviewModalProps = {
  booking: BookingRecord
  onSubmit: (rating: number, text: string) => Promise<void>
  onClose: () => void
}

export function ReviewModal({ booking, onSubmit, onClose }: ReviewModalProps) {
  const [rating, setRating] = useState(5)
  const [reviewText, setReviewText] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await onSubmit(rating, reviewText)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl bg-background p-6 shadow-xl">
        <h3 className="text-lg font-bold">Rate Your Experience</h3>
        <p className="text-xs text-muted-foreground mt-1 mb-4">
          How was <span className="font-semibold text-foreground">{booking.serviceName}</span>?
        </p>

        <form onSubmit={handleSubmit}>
          {/* Star Rating */}
          <div className="flex justify-center gap-2 mb-5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star className={`h-9 w-9 ${star <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
              </button>
            ))}
          </div>

          <textarea
            className="w-full rounded-xl border border-border bg-card p-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary mb-4"
            rows={3}
            placeholder="Share your experience (optional)"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
          />

          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="flex-1 rounded-xl">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Review"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
