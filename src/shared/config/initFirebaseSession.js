import { signInWithCustomToken, signOut } from "firebase/auth";
import { auth as firebaseAuth } from "./firebase";

let failedToken = null;

export async function initFirebaseSession(internalJwt) {
  console.log("[Firebase] initFirebaseSession CALLED");

  console.log("[Firebase] Input:", {
    hasToken: !!internalJwt,
    failedTokenMatches: failedToken === internalJwt,
    currentUser: firebaseAuth.currentUser?.uid ?? null,
  });

  if (!internalJwt) {
    console.warn("[Firebase] No internal JWT");
    return null;
  }

  if (failedToken === internalJwt) {
    console.warn("[Firebase] Token is marked as failed");
    return null;
  }

  try {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "/api";

    console.log("[Firebase] Fetching Firebase token...");

    const res = await fetch(`${baseUrl}/firebase/token`, {
      headers: {
        Authorization: `Bearer ${internalJwt}`,
      },
    });

    console.log("[Firebase] Firebase token response:", {
      ok: res.ok,
      status: res.status,
    });

    if (!res.ok) {
      failedToken = internalJwt;

      const text = await res.text().catch(() => "");

      console.warn("[Firebase] /firebase/token failed:", text);

      return null;
    }

    const response = await res.json();

    console.log("[Firebase] API response:", {
      success: response.success,
      statusCode: response.statusCode,
      hasData: !!response.data,
      hasFirebaseToken: !!response.data?.firebaseToken,
    });

    const firebaseToken = response.data?.firebaseToken;

    if (!firebaseToken) {
      failedToken = internalJwt;

      console.error("[Firebase] Response không có firebaseToken:", response);

      return null;
    }

    console.log("[Firebase] Firebase token received");

    if (firebaseAuth.currentUser) {
      console.log(
        "[Firebase] Signing out previous Firebase user:",
        firebaseAuth.currentUser.uid,
      );

      await signOut(firebaseAuth);

      console.log("[Firebase] Previous Firebase user signed out");
    }

    console.log("[Firebase] Signing in with custom token...");

    const credential = await signInWithCustomToken(firebaseAuth, firebaseToken);

    console.log("[Firebase] SIGN IN SUCCESS:", {
      uid: credential.user.uid,
      email: credential.user.email,
    });

    return credential.user;
  } catch (err) {
    failedToken = internalJwt;

    console.error("[Firebase] initFirebaseSession ERROR:", err);

    return null;
  }
}
