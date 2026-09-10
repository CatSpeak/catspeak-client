import React from "react"
import { Captions } from "lucide-react"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import ControlButton from "./ControlButton"

const ControlBarSubtitles = ({ className = "" }) => {
  const {
    showCC,
    setShowCC,
    isAISession,
    showRoomSubtitles,
    isStartingSubtitles,
    isStoppingSubtitles,
    subtitleSupportedLangs,
    startSubtitles,
    stopSubtitles,
  } = useGlobalVideoCall()

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
        isActive={showRoomSubtitles}
        isLoading={isStartingSubtitles || isStoppingSubtitles}
        onClick={() => {
          if (showRoomSubtitles) {
            stopSubtitles()
          } else {
            startSubtitles(subtitleSupportedLangs[0])
          }
        }}
        title={showRoomSubtitles ? "Turn subtitles off" : "Turn subtitles on"}
        iconActive={<Captions className="w-6 h-6" />}
        iconInactive={<Captions className="w-6 h-6" />}
      />
    </div>
  )
}

export default ControlBarSubtitles
