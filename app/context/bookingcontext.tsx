"use client"

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react"

export type Booking = {
  serviceName: string
  date: string
  time: string
  price: number
}

type BookingContextValue = {
  booking: Booking | null
  setBooking: Dispatch<SetStateAction<Booking | null>>
}

const BookingContext = createContext<BookingContextValue | undefined>(undefined)

export function BookingProvider({ children }: { children: ReactNode }) {
  const [booking, setBooking] = useState<Booking | null>(null)
  const value = useMemo(() => ({ booking, setBooking }), [booking])

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
}

export function useBooking() {
  const context = useContext(BookingContext)

  if (!context) {
    throw new Error("useBooking must be used within a BookingProvider")
  }

  return context
}
