"use client"

import { useState } from "react"
import { useAuth } from "@/app/context/auth-context"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import {
  Sparkles,
  Briefcase,
  MapPin,
  Phone,
  User,
  CheckCircle2,
  Loader2,
  Award,
  IndianRupee,
  FileText,
} from "lucide-react"

const CATEGORIES = [
  "Cleaning",
  "Salon & Spa",
  "Appliance Repair",
  "Electrician",
  "Plumbing",
  "Painting",
  "Wellness",
  "Carpentry",
]

const CITIES = [
  "Bengaluru",
  "Delhi NCR",
  "Mumbai",
  "Hyderabad",
  "Pune",
  "Chennai",
  "Kolkata",
  "Ahmedabad",
]

const DEFAULT_SERVICES: Record<string, Array<{ name: string; price: number; duration: string; description: string }>> = {
  Cleaning: [
    { name: "Deep Bathroom Cleaning", price: 599, duration: "60 min", description: "Intense tile & fittings cleaning." },
    { name: "Full Home Deep Cleaning", price: 1499, duration: "180 min", description: "Complete home sanitization." },
  ],
  "Salon & Spa": [
    { name: "Men's Haircut & Grooming", price: 349, duration: "45 min", description: "Haircut, styling & beard trim." },
    { name: "Herbal Facial & Cleanup", price: 699, duration: "60 min", description: "Glowing skin treatment." },
  ],
  "Appliance Repair": [
    { name: "AC Power Jet Deep Service", price: 549, duration: "45 min", description: "Indoor & outdoor unit cleaning." },
    { name: "Washing Machine Diagnostic", price: 299, duration: "30 min", description: "Motor & drain inspection." },
  ],
  Electrician: [
    { name: "Switchboard & Wiring Fix", price: 199, duration: "30 min", description: "Short circuit & switch repair." },
    { name: "Ceiling Fan Installation", price: 249, duration: "30 min", description: "Fan mounting & wiring." },
  ],
  Plumbing: [
    { name: "Water Tap Leakage Repair", price: 249, duration: "30 min", description: "Fix faucet leak & washer change." },
    { name: "Drainage & Blockage Clear", price: 399, duration: "45 min", description: "Sink or pipe unclogging." },
  ],
  Painting: [
    { name: "1 Room Wall Painting", price: 2499, duration: "1 Day", description: "Primer + 2 coats premium emulsion." },
  ],
  Wellness: [
    { name: "Deep Tissue Body Massage", price: 1199, duration: "60 min", description: "Pain relief & acupressure therapy." },
  ],
  Carpentry: [
    { name: "Door Lock & Handle Repair", price: 299, duration: "30 min", description: "Lock alignment & hardware fix." },
  ],
}

interface PartnerOnboardingProps {
  onCompleted: () => void
}

export function PartnerOnboarding({ onCompleted }: PartnerOnboardingProps) {
  const { user, userProfile } = useAuth()

  const [businessName, setBusinessName] = useState(userProfile?.displayName || user?.displayName || "")
  const [phone, setPhone] = useState(userProfile?.phoneNumber || user?.phoneNumber || "")
  const [category, setCategory] = useState("Cleaning")
  const [city, setCity] = useState("Bengaluru")
  const [experienceYears, setExperienceYears] = useState("3")
  const [bio, setBio] = useState("")
  const [basePrice, setBasePrice] = useState("499")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSubmitting(true)
    setError(null)

    try {
      const initialServices = DEFAULT_SERVICES[category] || [
        { name: `${category} Standard Service`, price: Number(basePrice) || 499, duration: "45 min", description: "Standard doorstep service." },
      ]

      const partnerDoc = {
        userId: user.uid,
        name: businessName.trim() || "Service Professional",
        email: user.email || "",
        phone: phone.trim(),
        category,
        city,
        experienceYears: Number(experienceYears) || 1,
        bio: bio.trim() || `Experienced ${category} expert serving ${city} with highest quality assurance.`,
        basePrice: Number(basePrice) || 499,
        isOnline: true,
        rating: 4.9,
        reviewCount: 18,
        jobsCompleted: 0,
        totalEarnings: 0,
        services: initialServices.map((s, idx) => ({ ...s, id: `srv-${Date.now()}-${idx}` })),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      await setDoc(doc(db, "partners", user.uid), partnerDoc)
      onCompleted()
    } catch (err: unknown) {
      console.error("Partner registration error:", err)
      const msg = err instanceof Error ? err.message : "Failed to register partner profile"
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-xl sm:p-10">
        {/* Header */}
        <div className="border-b border-border pb-6 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            HarGhar Partner Network
          </span>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Register as a Service Professional
          </h1>
          <p className="mx-auto mt-2 max-w-lg text-xs text-muted-foreground sm:text-sm">
            Setup your professional profile in 2 minutes. Start receiving customer bookings with guaranteed on-time payouts.
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-xs font-medium text-destructive">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="grid gap-5 sm:grid-cols-2">
            {/* Full / Business Name */}
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <User className="h-3.5 w-3.5 text-primary" /> Full Name / Business Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kumar / CleanPro Services"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Phone className="h-3.5 w-3.5 text-primary" /> Contact Number
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. +91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {/* Primary Category */}
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Briefcase className="h-3.5 w-3.5 text-primary" /> Primary Skill / Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Operational City */}
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <MapPin className="h-3.5 w-3.5 text-primary" /> Service City
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {/* Experience */}
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Award className="h-3.5 w-3.5 text-primary" /> Experience (in years)
              </label>
              <input
                type="number"
                min="0"
                max="40"
                required
                placeholder="e.g. 4"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Starting Rate */}
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <IndianRupee className="h-3.5 w-3.5 text-primary" /> Starting Service Fee (₹)
              </label>
              <input
                type="number"
                min="99"
                max="50000"
                required
                placeholder="e.g. 499"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Bio / Description */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <FileText className="h-3.5 w-3.5 text-primary" /> Professional Bio & Work Details
            </label>
            <textarea
              rows={3}
              placeholder="Tell customers about your tools, background, certifications, and service guarantee..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full rounded-2xl border border-border bg-background p-4 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
            />
          </div>

          {/* Benefits summary callout */}
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
            <h4 className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4" /> Partner Guarantee & Benefits
            </h4>
            <ul className="mt-2 grid gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 sm:grid-cols-2">
              <li>• Direct customer payments (Cash / UPI)</li>
              <li>• Set your own working hours & availability</li>
              <li>• 100% verified customer bookings</li>
              <li>• Dedicated HarGhar Partner Helpline support</li>
            </ul>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl py-6 text-sm font-semibold shadow-md"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Your Partner Profile...
              </>
            ) : (
              "Complete Registration & Enter Dashboard"
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
