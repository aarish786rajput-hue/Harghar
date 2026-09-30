"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/app/context/auth-context"
import { X, Phone, ShieldCheck, ArrowLeft, Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HarGharLogo } from "@/components/harghar-logo"
import type { ConfirmationResult } from "firebase/auth"

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, signInWithGoogle, setupRecaptcha, sendOtp } = useAuth()

  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [otpCode, setOtpCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
  const [timer, setTimer] = useState(30)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Reset state when modal is closed
  useEffect(() => {
    if (!isAuthModalOpen) {
      setStep("phone")
      setPhoneNumber("")
      setOtpCode("")
      setError(null)
      setLoading(false)
      setGoogleLoading(false)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isAuthModalOpen])

  // Countdown timer for resend OTP
  useEffect(() => {
    if (step === "otp" && timer > 0) {
      timerRef.current = setTimeout(() => setTimer((prev) => prev - 1), 1000)
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [step, timer])

  if (!isAuthModalOpen) return null

  // Handle Google Login
  const handleGoogleSignIn = async () => {
    setError(null)
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Google sign in failed"
      if (!errorMessage.includes("popup-closed-by-user")) {
        setError(errorMessage)
      }
    } finally {
      setGoogleLoading(false)
    }
  }

  // Handle Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const cleaned = phoneNumber.replace(/\D/g, "")
    if (cleaned.length !== 10) {
      setError("Please enter a valid 10-digit mobile number")
      return
    }

    const fullPhone = `+91${cleaned}`
    setLoading(true)

    try {
      const verifier = setupRecaptcha("recaptcha-container")
      const result = await sendOtp(fullPhone, verifier)
      setConfirmationResult(result)
      setStep("otp")
      setTimer(30)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send OTP"
      if (errorMessage.includes("billing-not-enabled")) {
        setError("Phone auth quota reached or project configuration needed. Please sign in with Google or check Firebase Console.")
      } else if (errorMessage.includes("invalid-phone-number")) {
        setError("Invalid phone number format.")
      } else {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  // Handle Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!confirmationResult) {
      setError("Session expired. Please request a new OTP.")
      return
    }

    if (otpCode.length !== 6) {
      setError("Please enter the 6-digit verification code")
      return
    }

    setLoading(true)
    try {
      await confirmationResult.confirm(otpCode)
      closeAuthModal()
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Invalid verification code"
      if (errorMessage.includes("invalid-verification-code")) {
        setError("Incorrect OTP. Please check and try again.")
      } else if (errorMessage.includes("code-expired")) {
        setError("This OTP has expired. Please request a new one.")
      } else {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  // Resend OTP
  const handleResendOtp = async () => {
    if (timer > 0) return
    setError(null)
    setLoading(true)
    try {
      const cleaned = phoneNumber.replace(/\D/g, "")
      const fullPhone = `+91${cleaned}`
      const verifier = setupRecaptcha("recaptcha-container")
      const result = await sendOtp(fullPhone, verifier)
      setConfirmationResult(result)
      setTimer(30)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Could not resend OTP"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      {/* Invisible reCAPTCHA container */}
      <div id="recaptcha-container" />

      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-2xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={closeAuthModal}
          aria-label="Close dialog"
          className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-auto items-center justify-center">
            <HarGharLogo size={48} />
          </div>
          <h2 id="auth-modal-title" className="mt-4 text-2xl font-bold tracking-tight text-foreground">
            {step === "phone" ? "Welcome to HarGhar" : "Verify Mobile Number"}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {step === "phone"
              ? "Sign in to book doorstep services & manage your orders"
              : `We sent a 6-digit OTP code to +91 ${phoneNumber}`}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs font-medium text-destructive">
            {error}
          </div>
        )}

        {step === "phone" ? (
          <div className="mt-6 space-y-4">
            {/* Google Sign In */}
            <button
              type="button"
              disabled={googleLoading || loading}
              onClick={handleGoogleSignIn}
              className="flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground transition-all hover:bg-secondary hover:border-primary/40 disabled:opacity-50"
            >
              {googleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              Continue with Google
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center py-1">
              <div className="w-full border-t border-border" />
              <span className="absolute bg-card px-3 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                Or with phone number
              </span>
            </div>

            {/* Phone Form */}
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Mobile Number
                </label>
                <div className="flex items-center rounded-2xl border border-border bg-background px-3.5 py-2.5 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                  <span className="text-sm font-semibold text-foreground pr-2 border-r border-border flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-primary" /> +91
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoFocus
                    required
                    maxLength={10}
                    placeholder="Enter 10 digit number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                    className="w-full pl-3 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || phoneNumber.length !== 10}
                className="w-full rounded-2xl py-5 text-sm font-semibold"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send OTP"}
              </Button>
            </form>
          </div>
        ) : (
          /* Step 2: OTP Verification */
          <div className="mt-6 space-y-4">
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-foreground">Enter 6-digit OTP</label>
                  <button
                    type="button"
                    onClick={() => {
                      setStep("phone")
                      setError(null)
                    }}
                    className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                  >
                    <ArrowLeft className="h-3 w-3" /> Change number
                  </button>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  autoFocus
                  required
                  maxLength={6}
                  placeholder="• • • • • •"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full tracking-widest text-center text-xl font-bold py-3 rounded-2xl border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Didn&apos;t receive OTP?</span>
                <button
                  type="button"
                  disabled={timer > 0 || loading}
                  onClick={handleResendOtp}
                  className={`font-semibold ${
                    timer > 0 ? "text-muted-foreground cursor-not-allowed" : "text-primary hover:underline"
                  }`}
                >
                  {timer > 0 ? `Resend in ${timer}s` : "Resend OTP"}
                </button>
              </div>

              <Button
                type="submit"
                disabled={loading || otpCode.length !== 6}
                className="w-full rounded-2xl py-5 text-sm font-semibold"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify & Continue"}
              </Button>
            </form>
          </div>
        )}

        <div className="mt-6 border-t border-border pt-4 text-center">
          <p className="text-[11px] text-muted-foreground flex items-center justify-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            Safe & secure login guaranteed
          </p>
        </div>
      </div>
    </div>
  )
}
