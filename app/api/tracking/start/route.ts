// Tracking API route — generates a tracking ID
// Actual Firestore writes happen client-side using existing Firebase setup
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const trackingId = "TRK-" + Math.floor(10000 + Math.random() * 90000)
    return NextResponse.json({ success: true, trackingId }, { status: 200 })
  } catch (error) {
    console.error("[Tracking/Start]", error)
    return NextResponse.json({ success: false, error: "Failed to start tracking" }, { status: 500 })
  }
}
