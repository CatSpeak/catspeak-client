import { useEffect } from "react"
import { useNavigate, useOutletContext, useParams } from "react-router-dom"
import { speakingApi, useGetSpeakingSessionQuery } from "../api/speakingApi"
import { SpeakingReportContainer } from "../components/speakingRoom"
import { flashcardReviewPath } from "../utils/flashcardReview"

const TERMINAL = new Set(["completed", "abandoned"])

const SpeakingResultPage = () => {
  const { sessionId, lang = "vi" } = useParams()
  const navigate = useNavigate()
  const { setSessionCredentials } = useOutletContext()
  const cachedSession = speakingApi.endpoints.getSpeakingSession.useQueryState(sessionId)
  const {
    data: session,
    isLoading: loadingSession,
    isError: sessionFailed,
    error: sessionError,
    refetch: refetchSession,
  } = useGetSpeakingSessionQuery(sessionId, {
    pollingInterval: cachedSession.isError || TERMINAL.has(cachedSession.data?.status) ? 0 : 1000,
  })
  const terminal = TERMINAL.has(session?.status)

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
        <button className="mt-4 px-4 py-2 font-bold text-[#990011] dark:text-red-400 underline cursor-pointer hover:opacity-80" onClick={refetchSession}>
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
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-rose-200 dark:border-rose-950 border-t-[#990011] dark:border-t-red-500" />
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Đang hoàn tất buổi luyện nói</h1>
        <p className="text-sm text-slate-600 dark:text-neutral-400">Báo cáo sẽ xuất hiện khi máy chủ lưu xong dữ liệu phiên.</p>
        <button className="text-sm font-semibold text-[#990011] dark:text-red-400 underline cursor-pointer hover:opacity-80" onClick={refetchSession}>
          Kiểm tra lại
        </button>
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
