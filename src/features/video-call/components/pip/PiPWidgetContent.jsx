import React from "react"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import { useDominantSpeaker } from "@/features/video-call/hooks/useDominantSpeaker"
import { useSessionTimer } from "@/features/video-call/hooks/useSessionTimer"

import PiPVideoContent from "./PiPVideoContent"
import PiPControlBar from "./PiPControlBar"

/**
 * The inner content of the PiP widget, reused in both the Document PiP
 * and the Fallback floating PiP.
 */
const PiPWidgetContent = ({ isNativeWindow }) => {
  const {
    participants,
    localParticipant,
    session,
    room: roomData,
    micOn,
    cameraOn,
    handleToggleMic,
    handleToggleCam,
    handleLeaveSession,
    returnToCall,
    screenShareTracks,
  } = useGlobalVideoCall()

  const dominant = useDominantSpeaker(participants, localParticipant)
  const { formattedElapsed } = useSessionTimer(session)

  // Room name
  const roomName = session?.name || session?.roomName || roomData?.name || "General"

  // Screen share takes priority
  const activeScreenShare =
    screenShareTracks?.length > 0 ? screenShareTracks[0] : null

  return (
    <div className="flex flex-col w-full h-full bg-black relative group">
      {/* Top Video Area */}
      <div className="relative w-full flex-1 min-h-0 bg-[#0f0f0f] flex items-center justify-center">
        <PiPVideoContent
          activeScreenShare={activeScreenShare}
          dominant={dominant}
        />

        {/* Top overlay */}
        <div className="absolute top-0 left-0 right-0 p-2 px-3 bg-gradient-to-b from-black/55 to-transparent flex items-center justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="text-[11px] font-semibold text-white drop-shadow-md max-w-[60%] truncate">
            {roomName}
          </span>
          {formattedElapsed && formattedElapsed !== "00:00" && (
            <span className="text-[10px] font-medium text-white/85 bg-black/35 px-1.5 py-0.5 rounded-md tabular-nums">
              {formattedElapsed}
            </span>
          )}
        </div>
      </div>

      {/* Bottom Controls Area */}
      <div className="shrink-0 bg-white">
        <PiPControlBar
          isNativeWindow={isNativeWindow}
          micOn={micOn}
          cameraOn={cameraOn}
          onToggleMic={handleToggleMic}
          onToggleCam={handleToggleCam}
          onReturnToCall={returnToCall}
          onLeave={handleLeaveSession}
        />
      </div>
    </div>
  )
}

export default PiPWidgetContent
