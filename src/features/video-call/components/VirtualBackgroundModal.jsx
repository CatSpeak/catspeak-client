import React, { useState } from "react"
import Modal from "@/shared/components/ui/Modal"
import VirtualBackgroundPicker from "./VirtualBackgroundPicker"
import BeautyPicker from "./BeautyPicker"
import { useLanguage } from "@/shared/context/LanguageContext"

const TABS = ["backgrounds", "beauty"]

const VirtualBackgroundModal = ({
  open,
  onClose,
  localStream,
  cameraOn,
  onToggleCam,
}) => {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState("backgrounds")
  const [beautyOptions, setBeautyOptions] = useState({
    smoothing: false,
    brightness: false,
    warmth: false,
    colorFilter: false,
  })

  const handleBeautyToggle = (key) => {
    setBeautyOptions((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleApply = (url) => {
    // Automatically turn on camera if an effect is selected while camera is off
    if (!cameraOn && url !== null && onToggleCam) {
      onToggleCam()
    }
  }

  const tabLabel = (tab) => {
    if (tab === "backgrounds")
      return t?.rooms?.videoCall?.tabBackgrounds || "Backgrounds"
    return t?.rooms?.beauty?.tabLabel || "Beauty"
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        t?.rooms?.videoCall?.backgroundsAndEffects || "Backgrounds and effects"
      }
      className="max-w-4xl md:max-w-4xl min-h-[500px]"
    >
      <div className="flex flex-col md:flex-row gap-5 h-full min-h-[400px]">
        {/* Left Column: Video Preview */}
        <div className="flex-1 min-w-0 flex flex-col bg-[#202124] rounded-xl overflow-hidden relative aspect-video w-full h-full">
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
              <span className="text-sm font-medium">
                {t?.rooms?.videoCall?.cameraOffWarning ||
                  "Your camera is turned off. Selecting an effect will turn it on."}
              </span>
            </div>
          )}
        </div>

        {/* Right Column: Tabbed Picker */}
        <div className="w-full md:w-80 flex-shrink-0 flex flex-col flex-1 md:h-auto">
          {/* Tab strip */}
          <div className="flex border-b border-[#E5E5E5] mb-3">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === tab
                    ? "border-cath-red-600 text-cath-red-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tabLabel(tab)}
              </button>
            ))}
          </div>

          {activeTab === "backgrounds" ? (
            <VirtualBackgroundPicker onApply={handleApply} className="p-0" />
          ) : (
            <BeautyPicker beautyOptions={beautyOptions} onToggle={handleBeautyToggle} />
          )}
        </div>
      </div>
    </Modal>
  )
}

export default VirtualBackgroundModal
