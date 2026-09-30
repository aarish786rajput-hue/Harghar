"use client"

import { Calendar, Clock } from "lucide-react"
import { AVAILABLE_DATES, TIME_SLOTS } from "./booking-constants"

type SlotSelectorProps = {
  selectedDate: string
  selectedTime: string
  onDateChange: (date: string) => void
  onTimeChange: (time: string) => void
}

export function SlotSelector({
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
}: SlotSelectorProps) {
  return (
    <div className="space-y-5">
      {/* Service Date */}
      <div>
        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-2">
          <Calendar className="h-3.5 w-3.5 text-primary" /> Select Preferred Day
        </label>
        <div className="grid grid-cols-3 gap-2">
          {AVAILABLE_DATES.map((date) => (
            <button
              key={date}
              type="button"
              onClick={() => onDateChange(date)}
              className={`rounded-xl border py-2 text-xs font-semibold transition-all ${
                selectedDate === date
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {date}
            </button>
          ))}
        </div>
      </div>

      {/* Time Slot */}
      <div>
        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-2">
          <Clock className="h-3.5 w-3.5 text-primary" /> Select Preferred Time Slot
        </label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {TIME_SLOTS.map((slot) => (
            <button
              key={slot}
              type="button"
              onClick={() => onTimeChange(slot)}
              className={`rounded-xl border px-3 py-2 text-xs font-medium text-left transition-all ${
                selectedTime === slot
                  ? "border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {slot}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
