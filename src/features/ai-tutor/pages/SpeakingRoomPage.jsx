import React, { useState } from "react"
import {
  SelectionPage,
  SpeakingPage,
  CompletePage,
  ResultPage,
  SpeakingReportContainer,
} from "../components/speakingRoom"
import { startSpeakingSession } from "../api/speakingClient"

const SpeakingRoomPage = () => {
  // Navigation state: 'selection' | 'speaking' | 'complete' | 'result'
  const [currentStep, setCurrentStep] = useState("selection")
  const [sessionData, setSessionData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  // Handle start session from SelectionPage
  const handleStartSpeaking = async (selectedTopic, currentLevel) => {
    if (!selectedTopic) return
    setIsLoading(true)

    // Extract HSK level number (e.g., "HSK 3 (B1)" -> 3)
    let hskNumber = 1
    if (typeof currentLevel === "string") {
      const match = currentLevel.match(/HSK\s*(\d)/i)
      if (match) {
        hskNumber = parseInt(match[1], 10)
      }
    } else if (typeof selectedTopic.hskLevel === "string") {
      const match = selectedTopic.hskLevel.match(/HSK\s*(\d)/i)
      if (match) {
        hskNumber = parseInt(match[1], 10)
      }
    }

    try {
      const res = await startSpeakingSession({
        topic_id: selectedTopic.id,
        hsk_level: hskNumber,
        voice: "female",
        speed: 1.0,
      })

      // POST /api/speaking/sessions trả token và url trong res.livekit, không nằm ở
      // gốc; thiếu hai dòng này thì SpeakingPage không bao giờ vào phòng.
      setSessionData({
        ...res,
        token: res?.livekit?.token ?? res?.token ?? null,
        topic: selectedTopic,
        hskLevel: res?.hsk_level ?? hskNumber,
        serverUrl: res?.livekit?.url || import.meta.env.VITE_LIVEKIT_URL || "ws://localhost:7880",
      })
      setCurrentStep("speaking")
    } catch (err) {
      console.error("[SpeakingRoomPage] Start session error:", err)
      // Fallback for development/testing if API server is offline
      setSessionData({
        session_id: "local_test_sess",
        token: null,
        topic: selectedTopic,
        hskLevel: hskNumber,
        serverUrl: "ws://localhost:7880",
      })
      setCurrentStep("speaking")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle End Session from SpeakingPage
  const handleEndSession = () => {
    setCurrentStep("complete")
  }

  // Handle Complete Page Action (Go to Result or back to Selection)
  const handleViewResult = () => {
    setCurrentStep("result")
  }

  const handleBackToSelection = () => {
    setSessionData(null)
    setCurrentStep("selection")
  }

  if (currentStep === "speaking") {
    return (
      <SpeakingPage
        sessionData={sessionData}
        topicTitle={sessionData?.topic?.title || "Mua hoa quả ở chợ"}
        onEndSession={handleEndSession}
      />
    )
  }

  // Phiên thật (có token) thì màn chờ ss10 và báo cáo ss11-ss13 lấy từ ai-api qua
  // SpeakingReportContainer. Chạy thử không có token thì giữ hai màn mẫu bên dưới.
  if ((currentStep === "complete" || currentStep === "result") && sessionData?.token && sessionData?.session_id) {
    return (
      <SpeakingReportContainer
        sessionId={sessionData.session_id}
        topicTitle={sessionData?.topic?.title}
        onBackToCatalog={handleBackToSelection}
        onGoHome={handleBackToSelection}
      />
    )
  }

  if (currentStep === "complete") {
    return (
      <CompletePage
        sessionData={sessionData}
        onViewResult={handleViewResult}
        onBackToHome={handleBackToSelection}
      />
    )
  }

  if (currentStep === "result") {
    return (
      <ResultPage
        sessionData={sessionData}
        onBackToHome={handleBackToSelection}
      />
    )
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-rose-200 border-t-[#990011] rounded-full animate-spin" />
            <p className="text-sm font-bold text-slate-800">Đang chuẩn bị phòng luyện nói...</p>
          </div>
        </div>
      )}
      <SelectionPage onStartSpeaking={handleStartSpeaking} />
    </div>
  )
}

export default SpeakingRoomPage
