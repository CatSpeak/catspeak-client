import React, { useState, useCallback } from "react"
import { toast } from "@/shared/utils/toastBridge"
import {
  SelectionPage,
  SpeakingPage,
  CompletePage,
  ResultPage,
  QuotaExceededModal,
} from "../components/speakingRoom"
import { startSpeakingSession, fetchSpeakingReport } from "../api/speakingClient"


const SpeakingRoomPage = () => {
  // Navigation state: 'selection' | 'speaking' | 'complete' | 'result'
  const [currentStep, setCurrentStep] = useState("selection")
  const [sessionData, setSessionData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [startError, setStartError] = useState(null)
  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState(false)

  // Handle start session from SelectionPage
  const handleStartSpeaking = async (selectedTopic, currentLevel) => {
    if (!selectedTopic) return
    setIsLoading(true)
    setStartError(null)

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

      const token = res.livekit?.token || res.token
      const serverUrl = res.livekit?.url || import.meta.env.VITE_LIVEKIT_URL || "ws://localhost:7880"
      const roomName = res.livekit?.room_name || res.room_name

      if (!token) {
        throw new Error("Không nhận được token kết nối LiveKit từ máy chủ.")
      }

      setSessionData({
        ...res,
        token,
        serverUrl,
        roomName,
        topic: res.topic || selectedTopic,
        hskLevel: hskNumber,
      })
      setCurrentStep("speaking")
    } catch (err) {
      console.error("[SpeakingRoomPage] Start session error:", err)
      const isQuotaErr =
        err?.status === 403 ||
        err?.code === "QUOTA_EXCEEDED" ||
        err?.message?.includes("QUOTA_EXCEEDED") ||
        err?.message?.includes("hạn mức")

      const errorMsg =
        err?.message || "Không thể khởi tạo phòng luyện nói. Vui lòng kiểm tra lại dịch vụ AI."

      toast.error(errorMsg)

      if (isQuotaErr) {
        setIsQuotaModalOpen(true)
      } else {
        setStartError(errorMsg)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Handle End Session from SpeakingPage
  const handleEndSession = useCallback(() => {
    setCurrentStep("complete")
  }, [])

  // Handle Complete Page Action (Go to Result or back to Selection)
  const handleViewResult = useCallback(async () => {
    try {
      const sessionId = sessionData?.session_id || sessionData?.id
      if (sessionId) {
        const report = await fetchSpeakingReport(sessionId)
        setSessionData((prev) => ({ ...prev, report }))
      }
    } catch (err) {
      console.warn("[SpeakingRoomPage] Fetch report warning:", err)
      toast.error(err?.message || "Không thể tải báo cáo kết quả buổi học.")
    } finally {
      setCurrentStep("result")
    }
  }, [sessionData])

  const handleBackToSelection = useCallback(() => {
    setSessionData(null)
    setStartError(null)
    setCurrentStep("selection")
  }, [])

  if (currentStep === "speaking") {
    return (
      <SpeakingPage
        sessionData={sessionData}
        topicTitle={sessionData?.topic?.title || sessionData?.topic?.title_vi || "Luyện nói tiếng Trung"}
        onEndSession={handleEndSession}
        onBackToSelection={handleBackToSelection}
      />
    )
  }

  if (currentStep === "complete") {
    return (
      <CompletePage
        sessionData={sessionData}
        onViewReport={handleViewResult}
        onBackToHome={handleBackToSelection}
      />
    )
  }

  if (currentStep === "result") {
    return (
      <ResultPage
        sessionData={sessionData}
        topicTitle={sessionData?.topic?.title_vi || sessionData?.topic?.title || "Luyện nói tiếng Trung"}
        onBackToCatalog={handleBackToSelection}
        onGoHome={handleBackToSelection}
      />
    )
  }


  return (
    <div className="relative">
      {isLoading && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-rose-200 border-t-[#990011] rounded-full animate-spin" />
            <p className="text-sm font-bold text-slate-800">Đang chuẩn bị phòng luyện nói & kết nối AI Tutor...</p>
          </div>
        </div>
      )}

      {startError && (
        <div className="max-w-7xl mx-auto mb-4 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 text-sm text-rose-800 shadow-2xs">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{startError}</span>
          </div>
          <button
            type="button"
            onClick={() => setStartError(null)}
            className="px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-900 font-bold rounded-lg text-xs cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      <SelectionPage onStartSpeaking={handleStartSpeaking} />

      <QuotaExceededModal
        isOpen={isQuotaModalOpen}
        onClose={() => setIsQuotaModalOpen(false)}
        onUpgrade={() => {
          window.location.href = "/pricing"
        }}
      />
    </div>
  )
}

export default SpeakingRoomPage
