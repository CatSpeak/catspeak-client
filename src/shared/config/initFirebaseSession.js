import { signInWithCustomToken } from "firebase/auth";
import { auth as firebaseAuth } from "./firebase";

let failedToken = null;

export async function initFirebaseSession(internalJwt) {
  if (!internalJwt) return null;

  // Tránh gọi lại liên tục nếu token này đã thất bại.
  if (failedToken === internalJwt) return null;

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

      return null;
    }

    const data = await res.json();
    const firebaseToken = data?.data?.firebaseToken;

    if (!firebaseToken) {
      failedToken = internalJwt;

      console.error(
        "[initFirebaseSession] Response không có firebaseToken:",
        data,
      );

      return null;
    }

    // signInWithCustomToken sẽ chuyển Firebase currentUser sang user của token mới.
    const credential = await signInWithCustomToken(firebaseAuth, firebaseToken);

    failedToken = null;

    // Đây là phần bắt buộc: trả user về cho useNotifications.
    return credential.user;
  } catch (err) {
    failedToken = internalJwt;

    console.error(
      "[initFirebaseSession] Lỗi khi khởi tạo Firebase session:",
      err,
    );

    return null;
  }
}
