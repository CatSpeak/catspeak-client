import React from "react"
import Modal from "@/shared/components/ui/Modal"
import VirtualBackgroundPicker from "./VirtualBackgroundPicker"
import { useLanguage } from "@/shared/context/LanguageContext"

const VirtualBackgroundModal = ({ open, onClose, localStream, cameraOn, onToggleCam }) => {
  const { t } = useLanguage()
  const handleApply = (url) => {
    // Automatically turn on camera if an effect is selected while camera is off
    if (!cameraOn && url !== null && onToggleCam) {
      onToggleCam()
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={t?.rooms?.videoCall?.backgroundsAndEffects || "Backgrounds and effects"} className="max-w-4xl md:max-w-4xl min-h-[500px]">
      <div className="flex flex-col md:flex-row gap-6 h-full min-h-[400px]">
        {/* Left Column: Video Preview */}
        <div className="flex-1 min-w-0 flex flex-col bg-[#202124] rounded-xl overflow-hidden relative aspect-video w-full my-auto">
          <video
            ref={(video) => {
              if (video && localStream) {
                video.srcObject = localStream
              }
            }}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${cameraOn ? "opacity-100" : "opacity-0"}`}
            style={{ transform: "scaleX(-1)" }}
          />
          {!cameraOn && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4 text-center">
              <span className="text-sm font-medium">{t?.rooms?.videoCall?.cameraOffWarning || "Your camera is turned off. Selecting an effect will turn it on."}</span>
            </div>
          )}
        </div>

        {/* Right Column: Picker */}
        <div className="w-full md:w-80 flex-shrink-0 flex flex-col h-[300px] md:h-auto border-l border-gray-100 pl-0 md:pl-6">
          <VirtualBackgroundPicker onApply={handleApply} />
        </div>
      </div>
    </Modal>
  )
}

export default VirtualBackgroundModal
