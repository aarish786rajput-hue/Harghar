import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Live Tracking | HarGhar",
  description: "Track your HarGhar professional in real-time",
}

export default function LiveTrackingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
