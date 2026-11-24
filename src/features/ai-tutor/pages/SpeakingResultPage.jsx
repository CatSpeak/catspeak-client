import { useEffect, useState } from "react"
import { useNavigate, useOutletContext, useParams } from "react-router-dom"
import { speakingApi, useGetSpeakingSessionQuery } from "../api/speakingApi"
import { SpeakingReportContainer } from "../components/speakingRoom"
import { flashcardReviewPath } from "../utils/flashcardReview"

const TERMINAL = new Set(["completed", "abandoned"])
const MAX_POLL_DURATION_MS = 60000

const SpeakingResultPage = () => {
  const { sessionId, lang = "vi" } = useParams()
  const navigate = useNavigate()
  const { setSessionCredentials } = useOutletContext()
  const [pollTimedOut, setPollTimedOut] = useState(false)
  const [prevSessionId, setPrevSessionId] = useState(sessionId)
  if (sessionId !== prevSessionId) {
    setPrevSessionId(sessionId)
    setPollTimedOut(false)
  }

  const cachedSession = speakingApi.endpoints.getSpeakingSession.useQueryState(sessionId)
  const shouldPoll =
    !pollTimedOut &&
    !cachedSession.isError &&
    !TERMINAL.has(cachedSession.data?.status)

  const {
    data: session,
    isLoading: loadingSession,
    isError: sessionFailed,
    error: sessionError,
    refetch: refetchSession,
  } = useGetSpeakingSessionQuery(sessionId, {
    pollingInterval: shouldPoll ? 1000 : 0,
  })
  const terminal = TERMINAL.has(session?.status)

  useEffect(() => {
    if (terminal || sessionFailed || pollTimedOut) return undefined
    const timerId = setTimeout(() => setPollTimedOut(true), MAX_POLL_DURATION_MS)
    return () => clearTimeout(timerId)
  }, [terminal, sessionFailed, pollTimedOut])

  const handleManualRefresh = () => {
    setPollTimedOut(false)
    refetchSession()
  }

  useEffect(() => {
    if (terminal) {
      setSessionCredentials(null)
    }
  }, [setSessionCredentials, terminal])

  const backToCatalog = () => navigate(`/${lang}/ai-tutor/speaking-room`, { replace: true })

  if (sessionFailed) {
    return (
      <div className="mx-auto max-w-xl py-20 text-center">
        <p className="text-sm text-rose-800 dark:text-red-400">{sessionError?.message || "Không thể tải trạng thái phiên."}</p>
        <button className="mt-4 px-4 py-2 font-bold text-[#990011] dark:text-red-400 underline cursor-pointer hover:opacity-80" onClick={handleManualRefresh}>
          Thử lại
        </button>
        <button className="mt-4 ml-4 px-4 py-2 font-bold text-slate-600 dark:text-neutral-300 underline cursor-pointer hover:opacity-80" onClick={backToCatalog}>
          Về danh mục
        </button>
      </div>
    )
  }

  if (loadingSession || !terminal) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-4 text-center">
        {!pollTimedOut && (
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-rose-200 dark:border-rose-950 border-t-[#990011] dark:border-t-red-500" />
        )}
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          {pollTimedOut ? "Xử lý mất nhiều thời gian hơn dự kiến" : "Đang hoàn tất buổi luyện nói"}
        </h1>
        <p className="text-sm text-slate-600 dark:text-neutral-400">
          {pollTimedOut
            ? "Bạn có thể nhấn kiểm tra lại để cập nhật báo cáo mới nhất."
            : "Báo cáo sẽ xuất hiện khi máy chủ lưu xong dữ liệu phiên."}
        </p>
        <div className="flex items-center gap-4">
          <button className="text-sm font-semibold text-[#990011] dark:text-red-400 underline cursor-pointer hover:opacity-80" onClick={handleManualRefresh}>
            Kiểm tra lại
          </button>
          {pollTimedOut && (
            <button className="text-sm font-semibold text-slate-600 dark:text-neutral-300 underline cursor-pointer hover:opacity-80" onClick={backToCatalog}>
              Về danh mục
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <SpeakingReportContainer
      key={sessionId}
      sessionId={sessionId}
      topicTitle={session?.topic?.title_vi || session?.topic?.title}
      isAbandoned={session?.status === "abandoned"}
      onBackToCatalog={backToCatalog}
      onGoHome={backToCatalog}
      onPracticeFlashcards={() => navigate(flashcardReviewPath(lang, { mode: "early", sourceSessionId: sessionId }))}
    />
  )
}

export default SpeakingResultPage
