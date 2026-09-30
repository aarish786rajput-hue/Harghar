"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/app/context/auth-context"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { PartnerDashboard, type PartnerData } from "@/components/partner/partner-dashboard"
import { PartnerOnboarding } from "@/components/partner/partner-onboarding"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { HarGharLogo } from "@/components/harghar-logo"
import {
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Clock,
  IndianRupee,
  Users,
  CheckCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
} from "lucide-react"

export default function PartnerPage() {
  const { user, loading: authLoading, openAuthModal } = useAuth()
  const [partnerData, setPartnerData] = useState<PartnerData | null>(null)
  const [loadingPartner, setLoadingPartner] = useState(true)

  const fetchPartner = useCallback(async () => {
    if (!user) {
      setPartnerData(null)
      setLoadingPartner(false)
      return
    }

    setLoadingPartner(true)
    try {
      const snap = await getDoc(doc(db, "partners", user.uid))
      if (snap.exists()) {
        setPartnerData(snap.data() as PartnerData)
      } else {
        setPartnerData(null)
      }
    } catch (err) {
      console.warn("Could not fetch partner record:", err)
      setPartnerData(null)
    } finally {
      setLoadingPartner(false)
    }
  }, [user])

  useEffect(() => {
    if (!authLoading) {
      fetchPartner()
    }
  }, [user, authLoading, fetchPartner])

  if (authLoading || (user && loadingPartner)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-3 text-sm font-medium text-muted-foreground">
          Loading HarGhar Partner Portal...
        </p>
      </div>
    )
  }

  // If user is NOT logged in, show Partner Landing Hero & Login CTA
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        {/* Navigation */}
        <header className="border-b border-border bg-background/80 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
            <Link href="/" className="flex items-center gap-2">
              <HarGharLogo size={34} showText={false} />
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                PRO
              </span>
            </Link>

            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 sm:py-24">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-primary/10 via-background to-background" />

          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Join 50,000+ Verified Service Professionals
            </span>

            <h1 className="mt-6 text-balance text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Grow your home services business with <span className="text-primary">HarGhar</span>
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-pretty text-sm text-muted-foreground sm:text-base">
              Get genuine customer bookings, instant payments, flexible working hours, and zero platform commission. Register today as a cleaning, electrician, AC repair, plumbing or salon pro.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                size="lg"
                onClick={openAuthModal}
                className="w-full rounded-2xl px-8 py-6 text-sm font-semibold shadow-lg sm:w-auto"
              >
                Sign In / Register as Partner <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Link
                href="/"
                className="inline-flex items-center rounded-2xl border border-border bg-card px-6 py-3 text-xs font-semibold text-foreground hover:bg-secondary"
              >
                Browse Customer App
              </Link>
            </div>

            {/* Value Props Grid */}
            <div className="mt-16 grid gap-6 text-left sm:grid-cols-3">
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                  <IndianRupee className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-bold text-foreground">Direct Customer Payouts</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Get paid directly after job completion via Cash or UPI with complete transparency.
                </p>
              </div>

              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Clock className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-bold text-foreground">Work on Your Schedule</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Turn your online status On or Off anytime. Accept jobs only when you are available.
                </p>
              </div>

              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-bold text-foreground">Verified Customers</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Every order is verified with authentic customer phone numbers, addresses, and time slots.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  // If user is logged in, but has not completed partner onboarding
  if (!partnerData) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-background/80 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
            <Link href="/" className="flex items-center gap-2">
              <HarGharLogo size={34} showText={false} />
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                ONBOARDING
              </span>
            </Link>

            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
            </Link>
          </div>
        </header>

        <PartnerOnboarding onCompleted={fetchPartner} />
      </div>
    )
  }

  // If user is registered partner, render Partner Dashboard
  return <PartnerDashboard partnerData={partnerData} onRefresh={fetchPartner} />
}
