import { signInWithCustomToken } from "firebase/auth";
import { auth as firebaseAuth } from "./firebase";

let failedToken = null;

export async function initFirebaseSession(internalJwt) {
  if (!internalJwt || firebaseAuth.currentUser || failedToken === internalJwt) return;
  try {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "/api";
    const res = await fetch(`${baseUrl}/firebase/token`, {
      headers: { Authorization: `Bearer ${internalJwt}` },
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

    const data = await res.json();
    const { firebaseToken } = data;

    if (!firebaseToken) {
      failedToken = internalJwt;
      console.error(
        "[initFirebaseSession] Response không có firebaseToken:",
        data,
      );
      return;
    }

    await signInWithCustomToken(firebaseAuth, firebaseToken);
  } catch (err) {
    failedToken = internalJwt;
    console.error(
      "[initFirebaseSession] Lỗi khi khởi tạo Firebase session:",
      err,
    );
    // Firebase session init is best-effort; notification will fall back to empty state
  }
}
