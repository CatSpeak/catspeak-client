import React from "react"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import { FileLock2, Link2Off, LogIn, Home } from "lucide-react"
import { useAuth } from "@/features/auth"
import { useAuthModal } from "@/shared/context/AuthModalContext"
import { useLanguage } from "@/shared/context/LanguageContext"

const cardClass =
  "mx-auto flex max-w-xl flex-col items-center gap-4 rounded-2xl border border-[#DEE0E5] bg-white px-6 py-12 text-center shadow-sm dark:border-[#3F3F3F] dark:bg-[#1A1A1A]"

const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-full bg-[#990011] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#b20a1c] dark:bg-[#FF6B6B] dark:text-[#1A1A1A] dark:hover:bg-[#ff8585]"

const secondaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-full border border-[#DEE0E5] px-5 py-2.5 text-sm font-bold text-[#14171F] transition-colors hover:bg-[#F7F7F8] dark:border-[#3F3F3F] dark:text-white dark:hover:bg-[#2A2A2A]"

/**
 * ISS-73: /shared-material/:token.
 * - Signed-in users are forwarded to their profile documents tab.
 * - Guests get an explicit "login to view" card instead of being silently
 *   bounced to "/" by AuthGuard, preserving the shared-material intent.
 */
const SharedMaterialRedirectPage = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { openAuthModal } = useAuthModal()
  const { t } = useLanguage()
  const mt = t.materials || {}

  if (!token) {
    return (
      <div className="flex min-h-[60vh] items-center px-4">
        <div className={cardClass}>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-[#b20a1c] dark:bg-rose-950/40 dark:text-[#FF6B6B]">
            <Link2Off className="h-8 w-8" />
          </div>
          <h1 className="text-xl font-bold text-[#14171F] dark:text-white">
            {mt.sharedLinkInvalidTitle || "Liên kết chia sẻ không hợp lệ"}
          </h1>
          <p className="text-sm text-[#6E788C] dark:text-neutral-400">
            {mt.sharedLinkInvalidDesc ||
              "Liên kết chia sẻ không đầy đủ hoặc đã bị thay đổi."}
          </p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className={secondaryButtonClass}
          >
            <Home className="h-4 w-4" />
            {mt.backHome || "Về trang chủ"}
          </button>
        </div>
      </div>
    )
  }

  const materialPath = `/workspace/profile?tab=documents&sharedMaterialToken=${encodeURIComponent(token)}`

  if (isAuthenticated) {
    return <Navigate to={materialPath} replace />
  }

  return (
    <div className="flex min-h-[60vh] items-center px-4">
      <div className={cardClass}>
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
          <FileLock2 className="h-8 w-8" />
        </div>
        <h1 className="text-xl font-bold text-[#14171F] dark:text-white">
          {mt.sharedMaterialLoginTitle ||
            "Tài liệu được chia sẻ yêu cầu đăng nhập"}
        </h1>
        <p className="max-w-md text-sm text-[#6E788C] dark:text-neutral-400">
          {mt.sharedMaterialLoginDesc ||
            "Đăng nhập để xem tài liệu được chia sẻ. Sau khi đăng nhập, bạn sẽ được chuyển thẳng đến tài liệu này."}
        </p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => openAuthModal("login", materialPath)}
            className={primaryButtonClass}
          >
            <LogIn className="h-4 w-4" />
            {mt.loginToView || "Đăng nhập để xem"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/")}
            className={secondaryButtonClass}
          >
            <Home className="h-4 w-4" />
            {mt.backHome || "Về trang chủ"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SharedMaterialRedirectPage
