import React, { useState } from "react"
import { Captions } from "lucide-react"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import { useSubtitleControls } from "@/features/video-call/hooks/useSubtitleControls"
import ControlButton from "./ControlButton"

const ControlBarSubtitles = ({ className = "" }) => {
  const { showCC, setShowCC, isAISession } = useGlobalVideoCall()
  const {
    isSubtitleActive,
    isStarting,
    subtitleSupportedLangs,
    startSubtitles,
    stopSubtitles,
  } = useSubtitleControls()

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
        isLoading={isStarting}
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
