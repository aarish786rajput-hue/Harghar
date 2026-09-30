"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/app/context/auth-context"
import { useRouter } from "next/navigation"
import { db } from "@/lib/firebase"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Plus, MapPin, Trash2, User, ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"
import { HarGharLogo } from "@/components/harghar-logo"
import { MobileNav } from "@/components/mobile-nav"

type Address = {
  id: string
  tag: string
  details: string
}

type SaveStatus = "idle" | "saving" | "success" | "error"

export default function ProfilePage() {
  const { user, userProfile, loading: authLoading, openAuthModal } = useAuth()
  const router = useRouter()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle")
  const [newAddressTag, setNewAddressTag] = useState("")
  const [newAddressDetails, setNewAddressDetails] = useState("")
  const [addingAddress, setAddingAddress] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) return // proxy handles redirect; guard against flash

    if (userProfile) {
      setName(userProfile.displayName || "")
      setPhone(userProfile.phoneNumber?.replace("+91", "").trim() || "")
    }

    if (user?.uid) {
      const fetch = async () => {
        try {
          const snap = await getDoc(doc(db, "users", user.uid))
          if (snap.exists() && snap.data().addresses) {
            setAddresses(snap.data().addresses)
          }
        } catch {
          // Non-critical — user can still use the page
        } finally {
          setLoading(false)
        }
      }
      fetch()
    }
  }, [user, userProfile, authLoading])

  const saveProfile = async () => {
    if (!user?.uid) return
    setSaveStatus("saving")
    try {
      await setDoc(doc(db, "users", user.uid), { displayName: name, phoneNumber: phone }, { merge: true })
      setSaveStatus("success")
      setTimeout(() => setSaveStatus("idle"), 2500)
    } catch {
      setSaveStatus("error")
      setTimeout(() => setSaveStatus("idle"), 2500)
    }
  }

  const addAddress = async () => {
    if (!user?.uid || !newAddressTag.trim() || !newAddressDetails.trim()) return
    setAddingAddress(true)
    const updated = [...addresses, { id: Date.now().toString(), tag: newAddressTag.trim(), details: newAddressDetails.trim() }]
    try {
      await setDoc(doc(db, "users", user.uid), { addresses: updated }, { merge: true })
      setAddresses(updated)
      setNewAddressTag("")
      setNewAddressDetails("")
    } catch {
      // silent — user retries
    } finally {
      setAddingAddress(false)
    }
  }

  const removeAddress = async (id: string) => {
    if (!user?.uid) return
    const updated = addresses.filter((a) => a.id !== id)
    try {
      await setDoc(doc(db, "users", user.uid), { addresses: updated }, { merge: true })
      setAddresses(updated)
    } catch {
      // silent
    }
  }

  // Auth loading
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Not logged in — proxy should redirect, but guard for flash
  if (!user) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <ProfileHeader />
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <User className="h-9 w-9 text-primary" />
          </span>
          <div>
            <h2 className="text-xl font-bold">Login Required</h2>
            <p className="mt-1 text-sm text-muted-foreground">Please login to view your profile.</p>
          </div>
          <Button onClick={openAuthModal} className="rounded-full px-8">Login / Register</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <ProfileHeader />
      <main className="mx-auto max-w-4xl px-4 py-8 pb-24 sm:px-6 lg:pb-10">
        <div className="mb-8 flex items-center gap-3">
          <Link href="/" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
            <p className="text-xs text-muted-foreground">Manage your personal info and saved addresses</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Personal Details */}
            <Card className="rounded-2xl border-border">
              <CardHeader>
                <CardTitle>Personal Details</CardTitle>
                <CardDescription>Update your name and phone number.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.email && (
                  <div className="rounded-xl border border-border bg-secondary/30 px-3 py-2 text-xs text-muted-foreground">
                    📧 {user.email}
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="fullname">Full Name</Label>
                  <Input id="fullname" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex items-center gap-2">
                    <span className="flex h-10 shrink-0 items-center rounded-xl border border-border bg-secondary/40 px-3 text-sm text-muted-foreground">+91</span>
                    <Input id="phone" type="tel" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} placeholder="9876543210" />
                  </div>
                </div>
                <Button onClick={saveProfile} disabled={saveStatus === "saving"} className="w-full rounded-xl">
                  {saveStatus === "saving" ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                  ) : saveStatus === "success" ? (
                    <><CheckCircle className="mr-2 h-4 w-4" /> Saved!</>
                  ) : saveStatus === "error" ? (
                    "Failed — Try Again"
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Saved Addresses */}
            <Card className="rounded-2xl border-border">
              <CardHeader>
                <CardTitle>Saved Addresses</CardTitle>
                <CardDescription>Add and manage your service locations.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {addresses.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-border py-6 text-center text-sm text-muted-foreground">
                    No saved addresses yet.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {addresses.map((addr) => (
                      <li key={addr.id} className="flex items-center justify-between gap-2 rounded-xl border border-border bg-secondary/20 px-3 py-2.5">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <MapPin className="h-4 w-4 shrink-0 text-primary" />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground">{addr.tag}</p>
                            <p className="truncate text-xs text-muted-foreground">{addr.details}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          aria-label={`Remove ${addr.tag}`}
                          onClick={() => removeAddress(addr.id)}
                          className="shrink-0 rounded-full p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="border-t border-border pt-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Add New Address</p>
                  <div className="flex flex-col gap-2">
                    <div className="grid grid-cols-3 gap-2">
                      <Input className="col-span-1" placeholder="Label (Home)" value={newAddressTag} onChange={(e) => setNewAddressTag(e.target.value)} />
                      <Input className="col-span-2" placeholder="Full address" value={newAddressDetails} onChange={(e) => setNewAddressDetails(e.target.value)} />
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={addingAddress || !newAddressTag.trim() || !newAddressDetails.trim()}
                      onClick={addAddress}
                      className="w-full rounded-xl"
                    >
                      {addingAddress ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                      Add Address
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      <MobileNav />
    </div>
  )
}

function ProfileHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="transition-transform hover:scale-105"><HarGharLogo size={34} /></Link>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">MY PROFILE</span>
      </div>
    </header>
  )
}
