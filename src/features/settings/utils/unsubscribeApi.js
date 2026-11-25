/**
 * Resolve Core API base path consistently with RTK Query (`baseApi.js`),
 * allowing fallback to `VITE_API_URL` if configured in custom deployments.
 */
export function resolveCoreApiBase() {
  const raw =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    "/api"
  return String(raw).replace(/\/+$/, "")
}

/**
 * Call `POST /auth/unsubscribe` on Core API using either a signed email
 * footer HMAC `token` or the signed-in caller's Bearer JWT.
 */
export async function unsubscribeEmailNotifications({
  email,
  token,
  authToken,
} = {}) {
  const trimmedEmail = typeof email === "string" ? email.trim() : ""
  if (!trimmedEmail) {
    throw new Error("Thiếu địa chỉ email để hủy đăng ký.")
  }

  const params = new URLSearchParams({ email: trimmedEmail })
  const trimmedToken = typeof token === "string" ? token.trim() : ""
  if (trimmedToken) {
    params.set("token", trimmedToken)
  }

  const headers = {}
  const rawAuth = typeof authToken === "string" ? authToken.trim() : ""
  if (rawAuth) {
    headers.Authorization = rawAuth.toLowerCase().startsWith("bearer ")
      ? rawAuth
      : `Bearer ${rawAuth}`
  }

  const response = await fetch(
    `${resolveCoreApiBase()}/auth/unsubscribe?${params.toString()}`,
    {
      method: "POST",
      headers,
    },
  )

  if (!response.ok) {
    let message =
      response.status === 401
        ? "Liên kết hủy đăng ký không hợp lệ hoặc thiếu mã xác thực."
        : "Không thể hủy nhận email thông báo lúc này. Vui lòng thử lại sau."
    try {
      const data = await response.json()
      if (typeof data?.message === "string" && data.message.trim()) {
        message = data.message
      }
    } catch {
      /* ignore non-JSON error body */
    }
    const err = new Error(message)
    err.status = response.status
    throw err
  }

  return response.json().catch(() => ({ success: true }))
}
