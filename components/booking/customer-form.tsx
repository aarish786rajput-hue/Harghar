"use client"

import { Phone, User, MapPin, Map, ShieldCheck, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LocationPickerModal } from "@/components/map/location-picker-modal"

type CustomerFormProps = {
  fullName: string
  phone: string
  address: string
  price: number
  submitting: boolean
  onNameChange: (v: string) => void
  onPhoneChange: (v: string) => void
  onAddressChange: (v: string) => void
}

export function CustomerForm({
  fullName,
  phone,
  address,
  price,
  submitting,
  onNameChange,
  onPhoneChange,
  onAddressChange,
}: CustomerFormProps) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-border bg-secondary/15 p-5 lg:col-span-5">
      <div>
        <h4 className="text-sm font-bold text-foreground mb-3">Customer Information</h4>

        <div className="space-y-3 text-xs">
          {/* Full Name */}
          <div>
            <label className="font-medium text-muted-foreground block mb-1">Full Name</label>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={fullName}
                onChange={(e) => onNameChange(e.target.value)}
                className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="font-medium text-muted-foreground block mb-1">Mobile Number</label>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="tel"
                required
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => onPhoneChange(e.target.value)}
                className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="font-medium text-muted-foreground block mb-1">Service Address / Flat</label>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                required
                placeholder="House / Flat No., Landmark"
                value={address}
                onChange={(e) => onAddressChange(e.target.value)}
                className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="mt-1.5">
              <LocationPickerModal
                mode="user"
                title="Pin Your Doorstep on Map"
                onLocationSelected={(displayName) => onAddressChange(displayName)}
                trigger={
                  <button
                    type="button"
                    className="flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/5 px-3 py-1.5 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/10 w-full justify-center"
                  >
                    <Map className="h-3.5 w-3.5" />
                    📍 Pick Exact Location on Map (easier for professional to reach you)
                  </button>
                }
              />
            </div>
          </div>
        </div>

        {/* Price Summary */}
        <div className="mt-4 rounded-xl bg-card border border-border p-3 text-xs space-y-1">
          <div className="flex justify-between text-muted-foreground">
            <span>Service Fee</span>
            <span>₹{price}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Convenience / Taxes</span>
            <span className="text-emerald-600 font-medium">Free</span>
          </div>
          <div className="flex justify-between border-t border-border pt-1 font-bold text-foreground">
            <span>Total Amount</span>
            <span>₹{price}</span>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="mt-5 space-y-2">
        <Button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl py-5 text-sm font-semibold"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Scheduling...
            </>
          ) : (
            "Pay Securely & Schedule"
          )}
        </Button>
        <p className="text-[11px] text-center text-muted-foreground flex items-center justify-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Powered by Razorpay Secure
        </p>
      </div>
    </div>
  )
}
