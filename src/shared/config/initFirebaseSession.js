import { signInWithCustomToken } from "firebase/auth"
import { auth as firebaseAuth } from "./firebase"

export async function initFirebaseSession(internalJwt) {
  if (firebaseAuth.currentUser) return
  try {
    const res = await fetch("/api/firebase/token", {
      headers: { Authorization: `Bearer ${internalJwt}` },
    })
    if (!res.ok) return
    const { firebaseToken } = await res.json()
    await signInWithCustomToken(firebaseAuth, firebaseToken)
  } catch {
    // Firebase session init is best-effort; notification will fall back to empty state
  }
}
