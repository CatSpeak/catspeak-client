import { useCallback, useState } from "react"
import { useNavigate, useOutletContext } from "react-router-dom"
import { toast } from "@/shared/utils/toastBridge"
import { QuotaExceededModal, SelectionPage } from "../components/speakingRoom"
import { useStartSpeakingSessionMutation } from "../api/speakingApi"

const SpeakingRoomPage = () => {
  const navigate = useNavigate()
  const { setSessionCredentials } = useOutletContext()
  const [startSession, { isLoading }] = useStartSpeakingSessionMutation()
  const [isQuotaModalOpen, setQuotaModalOpen] = useState(false)

  const handleStartSpeaking = useCallback(async (topic, hskLevel) => {
    if (!topic?.id || isLoading) return
    try {
      const session = await startSession({ topic_id: topic.id, hsk_level: hskLevel }).unwrap()
      const credentials = {
        session_id: session.session_id,
        livekit: session.livekit,
        topic: session.topic,
        hsk_level: session.hsk_level,
        started_at: session.created_at,
      }
      setSessionCredentials(credentials)
      navigate(`sessions/${session.session_id}`)
    } catch (error) {
      const code = error?.data?.code || error?.data?.detail?.code || error?.code
      if (code === "QUOTA_EXCEEDED") {
        setQuotaModalOpen(true)
        return
      }
      if (code === "SESSION_ACTIVE_ELSEWHERE") {
        toast.error("Tài khoản đang có một phiên luyện nói trên thiết bị khác.")
        return
      }
      toast.error(error?.data?.detail?.message || error?.message || "Không thể bắt đầu phiên luyện nói.")
    }
  }, [isLoading, navigate, setSessionCredentials, startSession])

  return (
    <div className="relative">
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs">
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-white p-6 shadow-2xl">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-rose-200 border-t-[#990011]" />
            <p className="text-sm font-bold text-slate-800">Đang chuẩn bị phòng luyện nói...</p>
          </div>
        </div>
      )}
      <SelectionPage
        onStartSpeaking={handleStartSpeaking}
        onQuotaExceeded={() => setQuotaModalOpen(true)}
      />
      <QuotaExceededModal
        isOpen={isQuotaModalOpen}
        onClose={() => setQuotaModalOpen(false)}
        onUpgrade={() => navigate("/pricing")}
      />
    </div>
  )
}

export default SpeakingRoomPage
