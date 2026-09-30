import { NextResponse } from "next/server";

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

export async function POST(request: Request) {
  try {
    const { amount } = await request.json();

    // If no real keys are configured, return a mock order for UI testing
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET || RAZORPAY_KEY_ID.includes("mock")) {
      console.warn("[Razorpay] No real API keys found — using mock order for UI testing.");
      const mockOrder = {
        id: "order_mock_" + Math.random().toString(36).substring(7),
        amount: amount * 100,
        currency: "INR",
        receipt: "receipt_mock",
      };
      return NextResponse.json({ order: mockOrder, success: true }, { status: 200 });
    }

    // Use Razorpay REST API directly (no npm SDK needed)
    const credentials = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64");

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${credentials}`,
      },
      body: JSON.stringify({
        amount: amount * 100, // paise
        currency: "INR",
        receipt: "receipt_" + Math.random().toString(36).substring(7),
      }),
    });

    if (!response.ok) {
      const errData = await response.json();
      console.error("[Razorpay] API error:", errData);
      return NextResponse.json({ error: "Razorpay API error", success: false }, { status: 500 });
    }

    const order = await response.json();
    return NextResponse.json({ order, success: true }, { status: 200 });

  } catch (error) {
    console.error("[Razorpay] Error creating order:", error);
    return NextResponse.json({ error: "Internal server error", success: false }, { status: 500 });
  }
}

