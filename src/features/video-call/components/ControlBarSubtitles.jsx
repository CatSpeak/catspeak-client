import React, { useState } from "react"
import { Captions } from "lucide-react"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import ControlButton from "./ControlButton"

const ControlBarSubtitles = ({ className = "" }) => {
  const {
    showCC,
    setShowCC,
    isAISession,
    isSubtitleActive,
    isStartingSubtitles,
    subtitleSupportedLangs,
    startSubtitles,
    stopSubtitles,
  } = useGlobalVideoCall()

  const [showSubtitlePicker, setShowSubtitlePicker] = useState(false)

  if (isAISession) {
    return (
      <ControlButton
        isActive={showCC}
        onClick={() => setShowCC(!showCC)}
        title={showCC ? "Turn captions off" : "Turn captions on"}
        iconActive={<Captions className="w-6 h-6" />}
        iconInactive={<Captions className="w-6 h-6" />}
        className={className}
      />
    )
  }

  return (
    <div className={`relative ${className}`}>
      <ControlButton
        isActive={isSubtitleActive}
        isLoading={isStartingSubtitles}
        onClick={() => {
          if (isSubtitleActive) {
            stopSubtitles()
          } else {
            startSubtitles(subtitleSupportedLangs[0])
          }
        }}
        title={isSubtitleActive ? "Turn subtitles off" : "Turn subtitles on"}
        iconActive={<Captions className="w-6 h-6" />}
        iconInactive={<Captions className="w-6 h-6" />}
      />
    </div>
  )
}

export default ControlBarSubtitles
