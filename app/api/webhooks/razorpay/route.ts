import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

// Note: Set RAZORPAY_WEBHOOK_SECRET in your .env.local file
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || 'your_webhook_secret_here';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);

    // Handle different Razorpay events
    switch (payload.event) {
      case 'payment.captured':
      case 'payment.authorized':
        const payment = payload.payload.payment.entity;
        const bookingId = payment.notes?.bookingId; // Assuming you pass bookingId in notes during checkout

        if (bookingId) {
          // Update the booking status in Firebase
          const bookingRef = doc(db, 'bookings', bookingId);
          await updateDoc(bookingRef, {
            paymentStatus: 'paid',
            paymentId: payment.id,
            updatedAt: serverTimestamp(),
          });
          console.log(`Booking ${bookingId} marked as paid.`);
        }
        break;

      case 'payment.failed':
        const failedPayment = payload.payload.payment.entity;
        const failedBookingId = failedPayment.notes?.bookingId;

        if (failedBookingId) {
          const bookingRef = doc(db, 'bookings', failedBookingId);
          await updateDoc(bookingRef, {
            paymentStatus: 'failed',
            errorReason: failedPayment.error_description,
            updatedAt: serverTimestamp(),
          });
          console.log(`Booking ${failedBookingId} payment failed.`);
        }
        break;

      default:
        console.log(`Unhandled event type: ${payload.event}`);
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
