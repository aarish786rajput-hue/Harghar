"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/app/context/auth-context"
import {
  doc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  serverTimestamp,
  increment,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { LocationPickerModal } from "@/components/map/location-picker-modal"
import { HarGharLogo } from "@/components/harghar-logo"
import {
  Briefcase,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  User,
  Star,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  IndianRupee,
  Activity,
  Layers,
  Check,
  TrendingUp,
  Settings,
  ArrowUpRight,
  Sparkles,
  LogOut,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
} from "lucide-react"

export type PartnerService = {
  id: string
  name: string
  price: number
  duration: string
  description: string
  active?: boolean
}

export type PartnerData = {
  userId: string
  name: string
  email: string
  phone: string
  category: string
  city: string
  experienceYears: number
  bio: string
  basePrice: number
  isOnline: boolean
  rating: number
  reviewCount: number
  jobsCompleted: number
  totalEarnings: number
  services: PartnerService[]
}

type BookingItem = {
  id: string
  bookingId: string
  serviceName: string
  price: number
  scheduledDate: string
  scheduledTime: string
  customerName: string
  customerPhone: string
  address: string
  status: "pending" | "confirmed" | "in-progress" | "completed" | "cancelled"
  partnerId?: string
  createdAt?: unknown
}

interface PartnerDashboardProps {
  partnerData: PartnerData
  onRefresh: () => void
}

export function PartnerDashboard({ partnerData, onRefresh }: PartnerDashboardProps) {
  const { logout } = useAuth()
  const [partner, setPartner] = useState<PartnerData>(partnerData)
  const [activeTab, setActiveTab] = useState<"jobs" | "services" | "profile" | "earnings">("jobs")
  const [jobFilter, setJobFilter] = useState<"all" | "pending" | "in-progress" | "completed">("all")
  
  // Bookings list
  const [bookings, setBookings] = useState<BookingItem[]>([])
  const [loadingBookings, setLoadingBookings] = useState(true)

  // New Service Form state
  const [isAddingService, setIsAddingService] = useState(false)
  const [newServiceName, setNewServiceName] = useState("")
  const [newServicePrice, setNewServicePrice] = useState("")
  const [newServiceDuration, setNewServiceDuration] = useState("45 min")
  const [newServiceDesc, setNewServiceDesc] = useState("")

  // Profile Form state
  const [editName, setEditName] = useState(partner.name)
  const [editPhone, setEditPhone] = useState(partner.phone)
  const [editCity, setEditCity] = useState(partner.city)
  const [editBio, setEditBio] = useState(partner.bio)
  const [editExperience, setEditExperience] = useState(String(partner.experienceYears))
  const [editBasePrice, setEditBasePrice] = useState(String(partner.basePrice))
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)

  // Listen to incoming bookings in real-time
  useEffect(() => {
    try {
      const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"))
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: BookingItem[] = []
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...(docSnap.data() as Omit<BookingItem, "id">) })
          })
          setBookings(list)
          setLoadingBookings(false)
        },
        async () => {
          // Fallback if index or rules issue: simple getDocs
          try {
            const snap = await getDocs(collection(db, "bookings"))
            const list: BookingItem[] = []
            snap.forEach((d) => {
              list.push({ id: d.id, ...(d.data() as Omit<BookingItem, "id">) })
            })
            setBookings(list.reverse())
          } catch (e) {
            console.warn("Could not load bookings:", e)
          } finally {
            setLoadingBookings(false)
          }
        }
      )
      return () => unsubscribe()
    } catch (err) {
      console.warn("Failed to subscribe to bookings:", err)
      setLoadingBookings(false)
    }
  }, [])

  // Online / Offline toggle
  const toggleOnline = async () => {
    const updated = !partner.isOnline
    setPartner((prev) => ({ ...prev, isOnline: updated }))
    try {
      const ref = doc(db, "partners", partner.userId)
      await updateDoc(ref, { isOnline: updated })
    } catch (err) {
      console.error("Could not toggle status:", err)
    }
  }

  // Accept Booking
  const handleAcceptBooking = async (booking: BookingItem) => {
    try {
      const ref = doc(db, "bookings", booking.id)
      await updateDoc(ref, {
        status: "in-progress",
        partnerId: partner.userId,
        partnerName: partner.name,
        partnerPhone: partner.phone,
        acceptedAt: serverTimestamp(),
      })

      setBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id
            ? { ...b, status: "in-progress", partnerId: partner.userId }
            : b
        )
      )
    } catch (err) {
      console.error("Error accepting booking:", err)
    }
  }

  // Complete Booking
  const handleCompleteBooking = async (booking: BookingItem) => {
    try {
      const bookingRef = doc(db, "bookings", booking.id)
      await updateDoc(bookingRef, {
        status: "completed",
        completedAt: serverTimestamp(),
      })

      // Increment partner earnings and jobsCompleted
      const partnerRef = doc(db, "partners", partner.userId)
      await updateDoc(partnerRef, {
        totalEarnings: increment(booking.price),
        jobsCompleted: increment(1),
      })

      setPartner((prev) => ({
        ...prev,
        totalEarnings: prev.totalEarnings + booking.price,
        jobsCompleted: prev.jobsCompleted + 1,
      }))

      setBookings((prev) =>
        prev.map((b) => (b.id === booking.id ? { ...b, status: "completed" } : b))
      )
    } catch (err) {
      console.error("Error completing booking:", err)
    }
  }

  // Add New Custom Service
  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newServiceName || !newServicePrice) return

    const newSrv: PartnerService = {
      id: `srv-${Date.now()}`,
      name: newServiceName.trim(),
      price: Number(newServicePrice) || 399,
      duration: newServiceDuration.trim() || "45 min",
      description: newServiceDesc.trim() || "Doorstep service by verified partner.",
      active: true,
    }

    const updatedServices = [...(partner.services || []), newSrv]
    setPartner((prev) => ({ ...prev, services: updatedServices }))

    try {
      const ref = doc(db, "partners", partner.userId)
      await updateDoc(ref, { services: updatedServices })
      setIsAddingService(false)
      setNewServiceName("")
      setNewServicePrice("")
      setNewServiceDesc("")
    } catch (err) {
      console.error("Error adding service:", err)
    }
  }

  // Delete / Toggle Service
  const handleDeleteService = async (serviceId: string) => {
    const updated = partner.services.filter((s) => s.id !== serviceId)
    setPartner((prev) => ({ ...prev, services: updated }))
    try {
      const ref = doc(db, "partners", partner.userId)
      await updateDoc(ref, { services: updated })
    } catch (err) {
      console.error("Error deleting service:", err)
    }
  }

  // Save Profile Updates
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileSaving(true)
    setProfileSuccess(false)

    try {
      const ref = doc(db, "partners", partner.userId)
      await updateDoc(ref, {
        name: editName.trim(),
        phone: editPhone.trim(),
        city: editCity.trim(),
        bio: editBio.trim(),
        experienceYears: Number(editExperience) || partner.experienceYears,
        basePrice: Number(editBasePrice) || partner.basePrice,
        updatedAt: serverTimestamp(),
      })

      setPartner((prev) => ({
        ...prev,
        name: editName.trim(),
        phone: editPhone.trim(),
        city: editCity.trim(),
        bio: editBio.trim(),
        experienceYears: Number(editExperience) || partner.experienceYears,
        basePrice: Number(editBasePrice) || partner.basePrice,
      }))
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 3000)
    } catch (err) {
      console.error("Error updating partner profile:", err)
    } finally {
      setProfileSaving(false)
    }
  }

  // Filtered bookings
  const filteredBookings = bookings.filter((b) => {
    if (jobFilter === "pending") return b.status === "pending" || b.status === "confirmed"
    if (jobFilter === "in-progress") return b.status === "in-progress"
    if (jobFilter === "completed") return b.status === "completed"
    return true
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <HarGharLogo size={34} showText={false} />
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                PARTNER
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {/* Online / Offline Switch */}
            <button
              type="button"
              onClick={toggleOnline}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                partner.isOnline
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border-border bg-secondary text-muted-foreground"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  partner.isOnline ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"
                }`}
              />
              {partner.isOnline ? "Online (Ready for Jobs)" : "Offline (Resting)"}
            </button>

            {/* Back to customer site */}
            <Link
              href="/"
              className="hidden items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground sm:flex"
            >
              Customer Site <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>

            {/* Sign out */}
            <button
              type="button"
              onClick={() => logout()}
              title="Logout"
              className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Partner Hero Summary Card */}
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 font-bold text-xl text-primary">
                {partner.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                    {partner.name}
                  </h1>
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                    {partner.category} Pro
                  </span>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-primary" /> {partner.city}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {partner.rating} ({partner.reviewCount || 18} reviews)
                  </span>
                  <span>•</span>
                  <span>{partner.experienceYears} Years Experience</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={activeTab === "jobs" ? "default" : "outline"}
                size="sm"
                className="rounded-xl text-xs"
                onClick={() => setActiveTab("jobs")}
              >
                <Activity className="mr-1.5 h-3.5 w-3.5" /> Jobs
              </Button>
              <Button
                variant={activeTab === "services" ? "default" : "outline"}
                size="sm"
                className="rounded-xl text-xs"
                onClick={() => setActiveTab("services")}
              >
                <Layers className="mr-1.5 h-3.5 w-3.5" /> Services ({partner.services?.length || 0})
              </Button>
              <Button
                variant={activeTab === "earnings" ? "default" : "outline"}
                size="sm"
                className="rounded-xl text-xs"
                onClick={() => setActiveTab("earnings")}
              >
                <TrendingUp className="mr-1.5 h-3.5 w-3.5" /> Earnings
              </Button>
              <Button
                variant={activeTab === "profile" ? "default" : "outline"}
                size="sm"
                className="rounded-xl text-xs"
                onClick={() => setActiveTab("profile")}
              >
                <Settings className="mr-1.5 h-3.5 w-3.5" /> Profile
              </Button>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="mt-8 grid grid-cols-2 gap-4 border-t border-border pt-6 sm:grid-cols-4">
            <div className="rounded-2xl bg-secondary/30 p-4">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <IndianRupee className="h-3.5 w-3.5 text-emerald-600" /> Total Earnings
              </span>
              <p className="mt-1 text-xl font-bold text-foreground">₹{partner.totalEarnings || 0}</p>
            </div>

            <div className="rounded-2xl bg-secondary/30 p-4">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Completed Jobs
              </span>
              <p className="mt-1 text-xl font-bold text-foreground">{partner.jobsCompleted || 0}</p>
            </div>

            <div className="rounded-2xl bg-secondary/30 p-4">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-amber-500" /> Active Requests
              </span>
              <p className="mt-1 text-xl font-bold text-foreground">
                {bookings.filter((b) => b.status === "pending" || b.status === "in-progress").length}
              </p>
            </div>

            <div className="rounded-2xl bg-secondary/30 p-4">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-sky-500" /> Partner Tier
              </span>
              <p className="mt-1 text-xl font-bold text-foreground">Gold Partner</p>
            </div>
          </div>
        </div>

        {/* Tab 1: Orders & Bookings */}
        {activeTab === "jobs" && (
          <section className="mt-8 space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground">Customer Job Orders</h2>
                <p className="text-xs text-muted-foreground">
                  Accept customer bookings and update status directly from your dashboard
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap gap-1.5">
                {(["all", "pending", "in-progress", "completed"] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setJobFilter(filter)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition-colors ${
                      jobFilter === filter
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-card text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {filter === "in-progress" ? "In Progress" : filter}
                  </button>
                ))}
              </div>
            </div>

            {loadingBookings ? (
              <div className="rounded-2xl border border-border py-12 text-center text-xs text-muted-foreground">
                Loading live customer bookings...
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
                <CheckCircle2 className="mx-auto h-10 w-10 text-muted-foreground/50" />
                <h3 className="mt-3 text-sm font-semibold text-foreground">No bookings found</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {jobFilter === "all"
                    ? "New customer bookings from the HarGhar customer app will show up here."
                    : `No bookings in '${jobFilter}' status right now.`}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredBookings.map((b) => {
                  const isInProgress = b.status === "in-progress"
                  const isCompleted = b.status === "completed"
                  const isPending = b.status === "pending" || b.status === "confirmed"

                  return (
                    <div
                      key={b.id}
                      className="flex flex-col justify-between rounded-3xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/40"
                    >
                      <div>
                        {/* Header with status badge */}
                        <div className="flex items-center justify-between border-b border-border pb-3">
                          <span className="font-mono text-xs font-bold text-primary">
                            {b.bookingId || "HG-ORDER"}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              isCompleted
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : isInProgress
                                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            }`}
                          >
                            {b.status}
                          </span>
                        </div>

                        {/* Details */}
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold text-foreground">{b.serviceName}</h3>
                            <span className="text-base font-bold text-foreground">₹{b.price}</span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5 text-primary" />
                            <span>Slot: {b.scheduledDate} ({b.scheduledTime})</span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <User className="h-3.5 w-3.5 text-primary" />
                            <span className="font-semibold text-foreground">{b.customerName || "Customer"}</span>
                            <span>•</span>
                            <a
                              href={`tel:${b.customerPhone}`}
                              className="flex items-center gap-1 font-semibold text-primary hover:underline"
                            >
                              <Phone className="h-3 w-3" /> {b.customerPhone || "No phone"}
                            </a>
                          </div>

                          {b.address && (
                            <div className="space-y-1">
                              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                                <span className="line-clamp-2">{b.address}</span>
                              </div>
                              {/* View address on map */}
                              <LocationPickerModal
                                mode="partner"
                                title={`Customer Location — ${b.customerName || "Customer"}`}
                                trigger={
                                  <button
                                    type="button"
                                    className="ml-5 flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/5 px-2 py-1 text-[10px] font-semibold text-primary hover:bg-primary/10 transition-colors"
                                  >
                                    <MapPin className="h-3 w-3" /> 🗺️ View on Map
                                  </button>
                                }
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="mt-5 flex items-center gap-2 border-t border-border pt-3">
                        {isPending && (
                          <Button
                            size="sm"
                            className="w-full rounded-xl text-xs font-semibold"
                            onClick={() => handleAcceptBooking(b)}
                          >
                            <Check className="mr-1.5 h-3.5 w-3.5" /> Accept Job
                          </Button>
                        )}

                        {isInProgress && (
                          <Button
                            size="sm"
                            className="w-full rounded-xl bg-emerald-600 text-xs font-semibold hover:bg-emerald-700"
                            onClick={() => handleCompleteBooking(b)}
                          >
                            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Mark Job as Completed
                          </Button>
                        )}

                        {isCompleted && (
                          <span className="w-full text-center text-xs font-semibold text-emerald-600 flex items-center justify-center gap-1 py-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Payout Added (₹{b.price})
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        )}

        {/* Tab 2: Services Offered */}
        {activeTab === "services" && (
          <section className="mt-8 space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground">My Service Catalog</h2>
                <p className="text-xs text-muted-foreground">
                  Manage the services you offer to HarGhar customers along with your pricing
                </p>
              </div>
              <Button
                size="sm"
                className="rounded-xl text-xs font-semibold"
                onClick={() => setIsAddingService((prev) => !prev)}
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Add New Service
              </Button>
            </div>

            {/* Add Service Collapsible Form */}
            {isAddingService && (
              <form
                onSubmit={handleAddService}
                className="rounded-3xl border border-primary/30 bg-primary/5 p-6 shadow-sm animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <h3 className="text-sm font-bold text-foreground">Add a Custom Service Offering</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-foreground">Service Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Balcony Pressure Wash"
                      value={newServiceName}
                      onChange={(e) => setNewServiceName(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-foreground">Price (₹)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 499"
                      value={newServicePrice}
                      onChange={(e) => setNewServicePrice(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-foreground">Duration</label>
                    <input
                      type="text"
                      placeholder="e.g. 45 min"
                      value={newServiceDuration}
                      onChange={(e) => setNewServiceDuration(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="mb-1 block text-xs font-medium text-foreground">Description</label>
                  <input
                    type="text"
                    placeholder="Brief description of what's included..."
                    value={newServiceDesc}
                    onChange={(e) => setNewServiceDesc(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>

                <div className="mt-4 flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl text-xs"
                    onClick={() => setIsAddingService(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="rounded-xl text-xs">
                    Save Service to Catalog
                  </Button>
                </div>
              </form>
            )}

            {/* List of Services */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(partner.services || []).map((srv) => (
                <div
                  key={srv.id}
                  className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-foreground">{srv.name}</h3>
                      <button
                        type="button"
                        onClick={() => handleDeleteService(srv.id)}
                        className="text-muted-foreground hover:text-destructive"
                        title="Remove service"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {srv.description}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
                      <Clock className="h-3 w-3" /> {srv.duration}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                    <span className="text-base font-bold text-foreground">₹{srv.price}</span>
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      Live on HarGhar
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tab 3: Earnings & Payouts */}
        {activeTab === "earnings" && (
          <section className="mt-8 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-foreground">Earnings & Payout Statement</h2>
              <p className="text-xs text-muted-foreground">
                Track all completed jobs, earnings payouts, and platform incentives
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-card p-5">
                <span className="text-xs text-muted-foreground">Total Accumulated Revenue</span>
                <p className="mt-1 text-2xl font-bold text-emerald-600">₹{partner.totalEarnings || 0}</p>
                <span className="mt-2 block text-[11px] text-muted-foreground">
                  Direct payments via UPI & Cash on delivery
                </span>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5">
                <span className="text-xs text-muted-foreground">Platform Commission</span>
                <p className="mt-1 text-2xl font-bold text-foreground">0%</p>
                <span className="mt-2 block text-[11px] text-emerald-600 font-semibold">
                  Zero commission promotion active
                </span>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5">
                <span className="text-xs text-muted-foreground">Completed Orders</span>
                <p className="mt-1 text-2xl font-bold text-foreground">{partner.jobsCompleted || 0}</p>
                <span className="mt-2 block text-[11px] text-muted-foreground">
                  Maintained 100% on-time fulfillment
                </span>
              </div>
            </div>

            {/* Completed Bookings History */}
            <div className="rounded-3xl border border-border bg-card p-6">
              <h3 className="text-sm font-bold text-foreground">Completed Jobs History</h3>
              {bookings.filter((b) => b.status === "completed").length === 0 ? (
                <p className="mt-4 text-center text-xs text-muted-foreground py-8">
                  No completed jobs yet. When you complete an order, payout statements appear here.
                </p>
              ) : (
                <div className="mt-4 divide-y divide-border">
                  {bookings
                    .filter((b) => b.status === "completed")
                    .map((b) => (
                      <div key={b.id} className="flex items-center justify-between py-3 text-xs">
                        <div>
                          <p className="font-semibold text-foreground">{b.serviceName}</p>
                          <p className="text-muted-foreground">
                            {b.customerName || "Customer"} • {b.scheduledDate}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-emerald-600">+₹{b.price}</span>
                          <p className="text-[10px] text-muted-foreground">Settled</p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Tab 4: Profile & KYC Settings */}
        {activeTab === "profile" && (
          <section className="mt-8 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-foreground">Professional Profile Settings</h2>
              <p className="text-xs text-muted-foreground">
                Keep your profile and contact details up-to-date so customers can reach you
              </p>
            </div>

            {profileSuccess && (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                ✓ Profile details successfully updated in HarGhar Partner Directory!
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">Full / Business Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">Service City</label>
                  <input
                    type="text"
                    required
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">Experience (Years)</label>
                  <input
                    type="number"
                    min="0"
                    value={editExperience}
                    onChange={(e) => setEditExperience(e.target.value)}
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">Base Starting Rate (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={editBasePrice}
                    onChange={(e) => setEditBasePrice(e.target.value)}
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">About / Bio</label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-background p-4 text-sm text-foreground outline-none focus:border-primary"
                />
              </div>

              <Button
                type="submit"
                disabled={profileSaving}
                className="rounded-2xl px-6 text-xs font-semibold"
              >
                {profileSaving ? "Saving Changes..." : "Save Profile Details"}
              </Button>
            </form>
          </section>
        )}
      </main>
    </div>
  )
}
