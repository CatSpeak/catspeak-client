import { signInWithCustomToken, signOut } from "firebase/auth";
import { auth as firebaseAuth } from "./firebase";

let failedToken = null;

export async function initFirebaseSession(internalJwt) {
  if (!internalJwt || failedToken === internalJwt) return;

  try {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "/api";

    const res = await fetch(`${baseUrl}/firebase/token`, {
      headers: {
        Authorization: `Bearer ${internalJwt}`,
      },
    });

    if (!res.ok) {
      failedToken = internalJwt;

      const text = await res.text().catch(() => "");

      console.warn(
        `[initFirebaseSession] Server returned ${res.status} ${res.statusText} for /api/firebase/token:`,
        text,
      );

      return;
    }

    const response = await res.json();
    const firebaseToken = response.data?.firebaseToken;

    if (!firebaseToken) {
      failedToken = internalJwt;

      console.error(
        "[initFirebaseSession] Response không có firebaseToken:",
        response,
      );

      return;
    }

    if (firebaseAuth.currentUser) {
      await signOut(firebaseAuth);
    }

    await signInWithCustomToken(firebaseAuth, firebaseToken);
    console.log("[Firebase]", {
      uid: firebaseAuth.currentUser?.uid,
      email: firebaseAuth.currentUser?.email,
    });
  } catch (err) {
    failedToken = internalJwt;

    console.error(
      "[initFirebaseSession] Lỗi khi khởi tạo Firebase session:",
      err,
    );
  }
}
