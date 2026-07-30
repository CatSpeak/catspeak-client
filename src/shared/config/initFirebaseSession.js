import { signInWithCustomToken } from "firebase/auth";
import { auth as firebaseAuth } from "./firebase";

export async function initFirebaseSession(internalJwt) {
  if (firebaseAuth.currentUser) return;
  try {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "/api";
    const res = await fetch(`${baseUrl}/firebase/token`, {
      headers: { Authorization: `Bearer ${internalJwt}` },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(
        `[initFirebaseSession] Lỗi khi gọi /api/firebase/token: status=${res.status} ${res.statusText}`,
        text,
      );
      return;
    }

    const data = await res.json();
    const { firebaseToken } = data;

    if (!firebaseToken) {
      console.error(
        "[initFirebaseSession] Response không có firebaseToken:",
        data,
      );
      return;
    }

    await signInWithCustomToken(firebaseAuth, firebaseToken);
  } catch (err) {
    console.error(
      "[initFirebaseSession] Lỗi khi khởi tạo Firebase session:",
      err,
    );
    // Firebase session init is best-effort; notification will fall back to empty state
  }
}
