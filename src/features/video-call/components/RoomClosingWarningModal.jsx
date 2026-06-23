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
    if (!isDismissed && remainingSeconds !== null && remainingSeconds > 0 && !audioPlayedRef.current) {
      audioPlayedRef.current = true
      const audio = new Audio("/sounds/warning-room-end.mp3")
      audio.play().catch(e => console.error("Audio play failed:", e))
    }
  }, [isDismissed, remainingSeconds])

  return (
    <Modal
      open={!isDismissed && remainingSeconds !== null && remainingSeconds > 0}
      onClose={() => setIsDismissed(true)}
      title={t?.rooms?.videoCall?.roomClosingTitle || "Room Ending Soon"}
      showCloseButton={true}
      className="max-w-md w-full"
    >
      <div className="flex flex-col items-center justify-center p-4 py-8 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
          <Clock size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {t?.rooms?.videoCall?.roomClosingSubtitleStatic || "This session will end soon."}
        </h3>
        <p className="text-gray-500">
          {t?.rooms?.videoCall?.roomClosingDescription ||
            "Please wrap up your conversation. The room will automatically close when the timer reaches zero."}
        </p>
      </div>
    </Modal>
  )
}

export default RoomClosingWarningModal
