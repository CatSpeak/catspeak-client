import React, { useEffect, useMemo, useRef, useState } from "react"
import { useSelector } from "react-redux"
import CompletePage from "../pages/CompletePage"
import ResultPage from "../pages/ResultPage"
import PronunciationDetailContainer from "./PronunciationDetailContainer"
import {
  isReportNotReady,
  speakingErrorCode,
  speakingPedagogyApi,
  useGetSpeakingReportQuery,
} from "../../../api/speakingPedagogyApi"
import { WAIT_CUTOFF_MS, toResultPageProps, waitProgress } from "../../../utils/speakingReport"

/**
 * ss10 → ss11 của một buổi nói, cộng ss12 và ss13 (TASK-AI-15, lát của Khôi).
 *
 * Luồng, theo E10 và E-SS-007 của tài liệu phân công:
 *   - Agent đóng phòng thì gọi finalize; báo cáo thường có trong 3 giây. ss10 hỏi
 *     GET /report mỗi giây, có báo cáo là sang ss11 (giữ ss10 tối thiểu 1,2 giây
 *     cho màn không chớp).
 *   - Quá 5 giây vẫn chưa có thì vẫn mở ss11 với khung cơ bản và tiếp tục hỏi.
 *   - Báo cáo "partial" (LLM chưa xong) hiện ngay, hỏi lại mỗi 3 giây tới khi
 *     "ready", tối đa 60 giây.
 *
 * Nơi dùng: trang /ai-tutor/speaking-room/report/:sessionId, hoặc phần vòng đời
 * phiên (Thái) render thẳng component này khi agent báo phase = ended.
 */
const MIN_WAIT_MS = 1200
const MAX_POLL_MS = 60000

const SpeakingReportContainer = ({
  sessionId,
  topicTitle,
  onBackToCatalog,
  onGoHome,
  onPracticeFlashcards,
}) => {
  const startedAt = useRef(0)
  const [elapsed, setElapsed] = useState(0)
  const [manualShow, setManualShow] = useState(false)
  const [pronOpen, setPronOpen] = useState(false)

  // Nhịp hỏi lại tính từ dữ liệu ĐÃ có trong cache: 1 giây khi chưa có báo cáo,
  // 3 giây khi còn partial, dừng khi ready, khi lỗi thật hoặc quá 60 giây.
  const selectCached = useMemo(
    () => speakingPedagogyApi.endpoints.getSpeakingReport.select(sessionId),
    [sessionId],
  )
  const cached = useSelector(selectCached)
  const cachedHardError = Boolean(cached?.error) && !isReportNotReady(cached.error)
  const settled = cachedHardError || cached?.data?.status === "ready" || elapsed > MAX_POLL_MS
  const pollMs = settled ? 0 : cached?.data?.status === "partial" ? 3000 : 1000

  const { data: report, error } = useGetSpeakingReportQuery(sessionId, {
    skip: !sessionId,
    pollingInterval: pollMs,
    refetchOnMountOrArgChange: true,
  })
  const hardError = Boolean(error) && !isReportNotReady(error)
  const showReport =
    manualShow || (report && elapsed >= MIN_WAIT_MS) || elapsed >= WAIT_CUTOFF_MS || hardError

  useEffect(() => {
    if (settled && showReport) return undefined
    if (!startedAt.current) startedAt.current = Date.now()
    const id = window.setInterval(() => setElapsed(Date.now() - startedAt.current), 250)
    return () => window.clearInterval(id)
  }, [settled, showReport])

  const props = useMemo(() => (report ? toResultPageProps(report, { topicTitle }) : null), [report, topicTitle])

  if (!showReport) {
    const progress = waitProgress(elapsed, Boolean(report))
    return (
      <CompletePage
        progressPercent={progress}
        estimatedTime={report ? "xong" : elapsed < 3000 ? "khoảng 2 giây" : "sắp xong"}
        doneCount={report ? 4 : Math.min(3, Math.floor(progress / 30))}
        onViewReport={() => setManualShow(true)}
      />
    )
  }

  const common = { onBackToCatalog, onGoHome, onPracticeFlashcards, levelPrefix: "" }

  if (!props) {
    // E-SS-007: chưa có báo cáo sau 5 giây, hoặc lỗi thật (không có quyền, mạng).
    const forbidden = speakingErrorCode(error) === "SPEAKING_REPORT_FORBIDDEN"
    return (
      <ResultPage
        {...common}
        topicTitle={topicTitle || "Luyện nói với AI"}
        duration="--:--"
        date=""
        overallScore="--"
        cefrLevel="Buổi luyện nói"
        metrics={[]}
        strengths={forbidden ? [] : ["Buổi nói của bạn đã được lưu lại."]}
        improvements={[]}
        savedVocabs={[]}
        showPronunciationLink={false}
        notice={
          forbidden
            ? "Bạn không có quyền xem báo cáo của buổi nói này."
            : hardError
              ? "Chưa tải được báo cáo. Bạn thử tải lại trang sau ít phút nhé."
              : "Báo cáo đang được hoàn tất, trang sẽ tự cập nhật trong giây lát."
        }
      />
    )
  }

  const notice = props.isEmptySession
    ? "Buổi này chưa ghi nhận câu trả lời nào. Lần sau bạn thử trả lời bằng một câu thật ngắn, AI sẽ giúp bạn nói tiếp."
    : props.isPartial
      ? "Đang hoàn tất nhận xét chi tiết và nghĩa từ vựng, báo cáo sẽ tự cập nhật."
      : null

  return (
    <>
      <ResultPage
        {...common}
        {...props}
        notice={notice}
        showPronunciationLink={!props.isEmptySession}
        onViewPronunciationDetails={() => setPronOpen(true)}
      />
      <PronunciationDetailContainer
        sessionId={sessionId}
        isOpen={pronOpen}
        onClose={() => setPronOpen(false)}
      />
    </>
  )
}

export default SpeakingReportContainer
