import React, { useState, useEffect, useRef } from "react"
import { Clock } from "lucide-react"
import Modal from "@/shared/components/ui/Modal"

const RoomClosingWarningModal = ({ remainingSeconds, t }) => {
  const [isDismissed, setIsDismissed] = useState(false)
  const audioPlayedRef = useRef(false)

  useEffect(() => {
    if (remainingSeconds === null || remainingSeconds <= 0) {
      setIsDismissed(false)
      audioPlayedRef.current = false
    }
  }, [remainingSeconds])

  useEffect(() => {
    if (
      !isDismissed &&
      remainingSeconds !== null &&
      remainingSeconds > 0 &&
      remainingSeconds <= 300 &&
      !audioPlayedRef.current
    ) {
      audioPlayedRef.current = true
      const audio = new Audio("/sounds/warning-room-end.mp3")
      audio.play().catch((e) => console.error("Audio play failed:", e))
    }
  }, [isDismissed, remainingSeconds])

  return (
    <Modal
      open={
        !isDismissed &&
        remainingSeconds !== null &&
        remainingSeconds > 0 &&
        remainingSeconds <= 300
      }
      onClose={() => setIsDismissed(true)}
      title={t?.rooms?.videoCall?.roomClosingTitle || "Phòng sắp hết giờ"}
      showCloseButton={true}
      className="max-w-md w-full"
    >
      <div className="flex flex-col items-center justify-center p-4 py-8 text-center">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4 border border-amber-200 shadow-sm animate-pulse">
          <Clock size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {t?.rooms?.videoCall?.roomClosingSubtitleStatic ||
            "Phòng sẽ tự động kết thúc sau ít phút nữa"}
        </h3>
        <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
          {t?.rooms?.videoCall?.roomClosingDescription ||
            "Còn chưa đầy 5 phút nữa cuộc gọi sẽ tự động đóng. Vui lòng hoàn tất cuộc hội thoại của bạn."}
        </p>
      </div>
    </Modal>
  )
}

export default RoomClosingWarningModal
