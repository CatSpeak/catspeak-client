import React from "react"
import { Navigate, useParams } from "react-router-dom"

/**
 * /:lang/ai-tutor/speaking-room/report/:sessionId
 *
 * Chuyển hướng URL báo cáo cũ sang route kết quả chính /sessions/:sessionId/result (bằng replace).
 */
const SpeakingReportPage = () => {
  const { lang, sessionId } = useParams()
  return (
    <Navigate
      to={`/${lang || "vi"}/ai-tutor/speaking-room/sessions/${sessionId}/result`}
      replace
    />
  )
}

export default SpeakingReportPage
