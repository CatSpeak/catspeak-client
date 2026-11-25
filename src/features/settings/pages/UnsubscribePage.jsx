import React, { useEffect, useRef, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { useSelector } from "react-redux"
import { CheckCircle, Loader2, XCircle } from "lucide-react"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import { unsubscribeEmailNotifications } from "@/features/settings/utils/unsubscribeApi"

function UnsubscribeContent({ email, hmacToken, authToken }) {
  const [status, setStatus] = useState(email ? "processing" : "error") // processing | success | error
  const [errorMsg, setErrorMsg] = useState(
    email ? "" : "Liên kết hủy đăng ký không hợp lệ (thiếu địa chỉ email).",
  )
  const handledRef = useRef(false)

  useEffect(() => {
    if (!email || handledRef.current) {
      return undefined
    }
    handledRef.current = true

    let mounted = true

    unsubscribeEmailNotifications({
      email,
      token: hmacToken,
      authToken,
    })
      .then(() => {
        if (!mounted) return
        try {
          localStorage.setItem("catspeak_email_notification_enabled", "false")
        } catch {
          /* ignore storage error */
        }
        setStatus("success")
      })
      .catch((err) => {
        if (!mounted) return
        setErrorMsg(
          err?.message ||
            "Liên kết hủy đăng ký không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập và cập nhật trong Cài đặt hệ thống.",
        )
        setStatus("error")
      })

    return () => {
      mounted = false
    }
  }, [email, hmacToken, authToken])

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-gray-50 dark:bg-[#0F0F0F] px-4 py-8">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1A1A1A] border border-border dark:border-[#3F3F3F] p-8 shadow-xl text-center">
        {status === "processing" && (
          <div className="py-8 flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-cath-red-600 dark:text-red-400" />
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Đang xử lý hủy nhận email...
            </h2>
          </div>
        )}

        {status === "success" && (
          <div className="py-6 flex flex-col items-center justify-center gap-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Đã hủy nhận email thông báo
              </h2>
              <p className="text-gray-600 dark:text-neutral-300 text-sm">
                Địa chỉ <span className="font-medium">{email}</span> sẽ không
                còn nhận email thông báo & tin tức từ CatSpeak.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link to="/">
                <PillButton className="px-6">Về trang chủ</PillButton>
              </Link>
              <Link
                to="/setting/system"
                className="text-sm font-medium text-cath-red-600 hover:underline dark:text-red-400"
              >
                Cài đặt thông báo
              </Link>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="py-6 flex flex-col items-center justify-center gap-4">
            <XCircle className="h-16 w-16 text-red-500" />
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Không thể hủy đăng ký
              </h2>
              <p className="text-gray-600 dark:text-neutral-300 text-sm">
                {errorMsg}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link to="/setting/system">
                <PillButton className="px-6">Mở cài đặt hệ thống</PillButton>
              </Link>
              <Link
                to="/"
                className="text-sm font-medium text-gray-600 hover:underline dark:text-neutral-300"
              >
                Về trang chủ
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const UnsubscribePage = () => {
  const [searchParams] = useSearchParams()
  const email = (searchParams.get("email") || "").trim()
  const hmacToken = (searchParams.get("token") || "").trim()
  const reduxAuthToken = useSelector((state) => state.auth?.token)
  const authToken = reduxAuthToken || localStorage.getItem("token") || ""

  return (
    <UnsubscribeContent
      key={`${email}::${hmacToken}`}
      email={email}
      hmacToken={hmacToken}
      authToken={authToken}
    />
  )
}

export default UnsubscribePage
