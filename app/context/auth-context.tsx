"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
  type User,
  type ConfirmationResult,
} from "firebase/auth"
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

export type UserProfile = {
  uid: string
  displayName: string | null
  email: string | null
  phoneNumber: string | null
  photoURL: string | null
  isAdmin?: boolean
  isPartner?: boolean
  createdAt?: unknown
  lastLoginAt?: unknown
}

type AuthContextType = {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  isAuthModalOpen: boolean
  openAuthModal: () => void
  closeAuthModal: () => void
  signInWithGoogle: () => Promise<void>
  setupRecaptcha: (containerId: string) => RecaptchaVerifier
  sendOtp: (phoneNumber: string, verifier: RecaptchaVerifier) => Promise<ConfirmationResult>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  const openAuthModal = () => setIsAuthModalOpen(true)
  const closeAuthModal = () => setIsAuthModalOpen(false)

  // Sync user profile to Firestore
  const syncUserProfile = async (firebaseUser: User) => {
    try {
      const userRef = doc(db, "users", firebaseUser.uid)
      const userSnap = await getDoc(userRef)
      const data = userSnap.data()

      const profileData: Partial<UserProfile> = {
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName || userProfile?.displayName || "HarGhar Customer",
        email: firebaseUser.email,
        phoneNumber: firebaseUser.phoneNumber,
        photoURL: firebaseUser.photoURL,
        lastLoginAt: serverTimestamp(),
      }

      if (!userSnap.exists()) {
        profileData.createdAt = serverTimestamp()
        profileData.isAdmin = false
        profileData.isPartner = false
      } else {
        profileData.isAdmin = data?.isAdmin || false
        profileData.isPartner = data?.isPartner || false
      }

      await setDoc(userRef, profileData, { merge: true })

      setUserProfile({
        uid: firebaseUser.uid,
        displayName: profileData.displayName || "HarGhar Customer",
        email: profileData.email || null,
        phoneNumber: profileData.phoneNumber || null,
        photoURL: profileData.photoURL || null,
        isAdmin: profileData.isAdmin,
        isPartner: profileData.isPartner,
      })
    } catch (err) {
      console.warn("Could not sync profile to Firestore:", err)
      setUserProfile({
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName || "HarGhar Customer",
        email: firebaseUser.email,
        phoneNumber: firebaseUser.phoneNumber,
        photoURL: firebaseUser.photoURL,
        isAdmin: false,
      })
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        // Set cookie for Next.js Middleware
        const token = await currentUser.getIdToken()
        document.cookie = `user-session=${token}; path=/; max-age=86400; SameSite=Lax`
        
        await syncUserProfile(currentUser)
      } else {
        setUserProfile(null)
        // Clear cookie
        document.cookie = "user-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Google Sign In
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: "select_account" })
      const result = await signInWithPopup(auth, provider)
      await syncUserProfile(result.user)
      closeAuthModal()
    } catch (error) {
      console.error("Google sign-in error:", error)
      throw error
    }
  }

  // Setup reCAPTCHA for Phone OTP
  const setupRecaptcha = (containerId: string): RecaptchaVerifier => {
    if (typeof window !== "undefined") {
      const existingVerifier = (window as unknown as { recaptchaVerifier?: RecaptchaVerifier }).recaptchaVerifier
      if (existingVerifier) {
        existingVerifier.clear()
      }
    }

    const verifier = new RecaptchaVerifier(auth, containerId, {
      size: "invisible",
      callback: () => {},
      "expired-callback": () => {
        console.warn("reCAPTCHA expired")
      },
    })

    if (typeof window !== "undefined") {
      ;(window as unknown as { recaptchaVerifier: RecaptchaVerifier }).recaptchaVerifier = verifier
    }

    return verifier
  }

  // Send OTP
  const sendOtp = async (phoneNumber: string, verifier: RecaptchaVerifier): Promise<ConfirmationResult> => {
    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, verifier)
      return confirmationResult
    } catch (error) {
      console.error("Send OTP error:", error)
      throw error
    }
  }

  // Logout
  const logout = async () => {
    try {
      await signOut(auth)
      setUser(null)
      setUserProfile(null)
      document.cookie = "user-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    } catch (error) {
      console.error("Sign out error:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        signInWithGoogle,
        setupRecaptcha,
        sendOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
