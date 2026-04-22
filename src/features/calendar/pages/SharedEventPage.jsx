import React, { useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { AlertTriangle } from "lucide-react"
import { useGetSharedEventQuery, useGetEventOccurrenceByIdQuery } from "@/store/api/eventsApi"
import { useLanguage } from "@/shared/context/LanguageContext"

const SharedEventPage = () => {
  const { t, language } = useLanguage()
  const { token } = useParams()
  const navigate = useNavigate()
  
  const { data, isLoading, isError, error } = useGetSharedEventQuery(token, {
    skip: !token,
  })

  // Log error to console for debugging
  useEffect(() => {
    if (isError && error) {
      console.error("Failed to fetch shared event:", error)
    }
  }, [isError, error])

  const targetIdRaw = data?.eventId || data?.event?.eventId || data?.event?.id || data?.shareLink?.eventId || data?.occurrenceId || data?.shareLink?.occurrenceId
  
  // To handle shared links created with an occurrenceId as the eventId,
  // we blindly fetch the occurrence API. If it succeeds, targetIdRaw is an occurrence.
  const { 
    data: occurrenceData, 
    isLoading: isLoadingOccurrence, 
    isFetching: isFetchingOccurrence,
    isUninitialized: isUninitializedOccurrence 
  } = useGetEventOccurrenceByIdQuery(targetIdRaw, {
    skip: !targetIdRaw,
  })

  // Smart redirect to the native event modal
  useEffect(() => {
    if (data) {
      if (data.shareLink && data.shareLink.isValid === false) {
        return // Stay on page to show invalid link error
      }

      // Wait to see if targetIdRaw was actually an occurrenceId.
      // We must check isFetching and isUninitialized to avoid React race conditions where the redirect happens before the fetch even starts.
      if (isLoadingOccurrence || isFetchingOccurrence || (targetIdRaw && isUninitializedOccurrence)) return;

      let targetId = targetIdRaw
      let occurrenceId = data?.occurrenceId || data?.shareLink?.occurrenceId

      if (occurrenceData) {
        targetId = occurrenceData.eventId !== undefined && occurrenceData.eventId !== 0 
          ? occurrenceData.eventId 
          : targetIdRaw;
          
        // If we queried the occurrence endpoint and it succeeded, the original targetIdRaw was indeed an occurrenceId
        if (!occurrenceId) {
          occurrenceId = targetIdRaw;
        }
      }

      const hasTargetId = targetId !== undefined && targetId !== null
      if (hasTargetId) {
        const params = new URLSearchParams()
        params.append("eventId", targetId)
        if (occurrenceId) {
          params.append("occurrenceId", occurrenceId)
        }
        
        navigate(`/${language}/cat-speak/calendar?${params.toString()}`, {
          replace: true,
        })
      }
    }
  }, [data, occurrenceData, isLoadingOccurrence, isFetchingOccurrence, isUninitializedOccurrence, language, navigate, targetIdRaw])

  if (isLoading || isLoadingOccurrence || isFetchingOccurrence) {
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

  const isInvalidLink = data?.shareLink && data.shareLink.isValid === false

  if (isError || (!isLoading && (!data || isInvalidLink))) {
    // Attempt to extract the specific backend error message
    const backendMessage = error?.data?.message
    const defaultMessage =
      t.calendar?.shared?.invalidLinkDesc ||
      "Liên kết chia sẻ này đã hết hạn, đã đạt giới hạn lượt xem, hoặc không tồn tại."

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
            {backendMessage || defaultMessage}
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
