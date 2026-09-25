import React from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { SpeakingReportContainer } from "../components/speakingRoom/report"

/**
 * /:lang/ai-tutor/speaking-room/report/:sessionId
 *
 * ss10 → ss11 của một buổi nói. Phần vòng đời phiên chuyển sang đây khi agent báo
 * phase = ended (kèm session_id), có thể truyền tên chủ đề qua state:
 *   navigate(`/${lang}/ai-tutor/speaking-room/report/${sessionId}`, { state: { topicTitle } })
 * Mở lại link sau này vẫn xem được báo cáo (ai-api kiểm chủ phiên).
 */
const SpeakingReportPage = () => {
  const { lang, sessionId } = useParams()
  const navigate = useNavigate()
  const { state } = useLocation()
  const base = `/${lang || "vi"}`

  return (
    <SpeakingReportContainer
      sessionId={sessionId}
      topicTitle={state?.topicTitle}
      onBackToCatalog={() => navigate(`${base}/ai-tutor/speaking-room`)}
      onGoHome={() => navigate(base)}
      onPracticeFlashcards={() => navigate(`${base}/ai-tutor/vocabulary-notebook`)}
    />
  )
}

export default SpeakingReportPage
