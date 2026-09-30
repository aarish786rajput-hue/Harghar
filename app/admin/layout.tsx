"use client"

import { useAuth } from "@/app/context/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Only redirect if loading is finished
    if (!loading) {
      if (!user) {
        router.push("/?loginRequired=true")
      } else if (userProfile && !userProfile.isAdmin) {
        // Not an admin, redirect to home
        router.push("/")
      }
    }
  }, [user, userProfile, loading, router])

  if (loading || !user || !userProfile?.isAdmin) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-muted/40">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      {children}
    </div>
  )
}
