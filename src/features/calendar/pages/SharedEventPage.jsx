import React, { useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { AlertTriangle } from "lucide-react"
import { useGetSharedEventQuery } from "@/store/api/eventsApi"
import { useLanguage } from "@/shared/context/LanguageContext"

const SharedEventPage = () => {
  const { t, language } = useLanguage()
  const { token } = useParams()
  const navigate = useNavigate()
  
  const { data, isLoading, isError } = useGetSharedEventQuery(token, {
    skip: !token,
  })

  // Smart redirect to the native event modal
  useEffect(() => {
    const targetId = data?.event?.eventId || data?.event?.id
    if (targetId) {
      navigate(`/${language}/cat-speak/calendar?eventId=${targetId}`, {
        replace: true,
      })
    }
  }, [data, language, navigate])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
        <div className="flex flex-col items-center gap-4 text-slate-500">
          <div className="w-10 h-10 border-4 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
          <p className="text-sm font-medium">
            {t.calendar?.shared?.loadingEventInfo ||
              "Đang tải thông tin sự kiện…"}
          </p>
        </div>
      </div>
    )
  }

  if (isError || (!isLoading && !data)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-slate-100 px-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
          <AlertTriangle
            className="mx-auto mb-4 text-red-400"
            size={48}
            strokeWidth={1.5}
          />
          <h1 className="text-xl font-bold text-gray-800 mb-2">
            {t.calendar?.shared?.invalidLink || "Liên kết không hợp lệ"}
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            {t.calendar?.shared?.invalidLinkDesc ||
              "Liên kết chia sẻ này đã hết hạn, đã đạt giới hạn lượt xem, hoặc không tồn tại."}
          </p>
          <Link
            to="/"
            className="inline-block bg-slate-800 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-slate-700 transition-colors"
          >
            {t.calendar?.shared?.backToHome || "Về trang chủ"}
          </Link>
        </div>
      </div>
    )
  }

  // Returns null while the useEffect runs the redirect
  return null
}

export default SharedEventPage
