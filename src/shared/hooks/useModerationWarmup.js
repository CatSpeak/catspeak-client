import { useEffect } from "react"
import { useSelector, useStore } from "react-redux"
import { selectIsAuthenticated } from "@/store/slices/authSlice"
import { useLanguage } from "@/shared/context/LanguageContext"
import { moderationApi } from "@/store/api/moderationApi"
import { WARM_EVERY_MS, shouldWarm, warmKindsFor } from "@/shared/utils/moderationWarmup"

/**
 * Người dùng đã đăng nhập đang mở app: nhắc dịch vụ kiểm duyệt nạp sẵn model text.
 * Gọi khi mở app, khi quay lại tab, và mỗi 10 phút khi tab còn hiện. Xem
 * shared/utils/moderationWarmup.js.
 */
export function ModerationWarmupSync() {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const { language } = useLanguage()
  const store = useStore()

  useEffect(() => {
    if (!isAuthenticated) return undefined
    const kinds = warmKindsFor(language)
    let lastAt = 0

    const warm = () => {
      if (document.visibilityState !== "visible") return
      const now = Date.now()
      if (!shouldWarm(lastAt, now)) return
      lastAt = now
      // track: false — lời gọi phụ trợ, không cần nằm lại trong cache. Lỗi thì bỏ qua.
      store.dispatch(
        moderationApi.endpoints.warmModeration.initiate({ kinds }, { track: false }),
      )
    }

    warm()
    const timer = setInterval(warm, WARM_EVERY_MS)
    document.addEventListener("visibilitychange", warm)
    window.addEventListener("focus", warm)
    return () => {
      clearInterval(timer)
      document.removeEventListener("visibilitychange", warm)
      window.removeEventListener("focus", warm)
    }
  }, [isAuthenticated, language, store])

  return null
}
