import React from "react"
import { useSelector } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"

import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import { useDominantSpeaker } from "@/features/video-call/hooks/useDominantSpeaker"
import { useSessionTimer } from "@/features/video-call/hooks/useSessionTimer"
import { usePiPDrag } from "@/features/video-call/hooks/usePiPDrag"
import { useLanguage } from "@/shared/context/LanguageContext"

import PiPVideoContent from "./PiPVideoContent"
import PiPControlBar from "./PiPControlBar"

/**
 * Floating Picture-in-Picture widget shown when the user navigates
 * away from the call page. Draggable, snaps to viewport corners.
 */
const PiPWidget = () => {
  const { isInCall, isPiP } = useSelector((s) => s.videoCall)
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

  const { t } = useLanguage()
  const dominant = useDominantSpeaker(participants, localParticipant)
  const { formattedElapsed } = useSessionTimer(session)
  const { position, constraintsRef, handleDragEnd } = usePiPDrag(isPiP)

  // Room name
  const roomName = session?.name || session?.roomName || roomData?.name || "General"

  // Screen share takes priority
  const activeScreenShare =
    screenShareTracks?.length > 0 ? screenShareTracks[0] : null

  const shouldRender = isInCall && isPiP

  return (
    <>
      {/* Drag boundary */}
      <div
        ref={constraintsRef}
        style={{
          position: "fixed",
          inset: "20px",
          pointerEvents: "none",
          zIndex: shouldRender ? 9998 : -1,
        }}
      />

      <AnimatePresence>
        {shouldRender && (
          <motion.div
            className="fixed z-[9999] w-[calc(100vw-40px)] max-w-[400px] flex flex-col rounded-[24px] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.28),0_2px_8px_rgba(0,0,0,0.12)] bg-white cursor-grab active:cursor-grabbing select-none touch-none group"
            key="pip-widget"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1, x: position.x, y: position.y }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            drag
            dragConstraints={constraintsRef}
            dragElastic={0.1}
            dragMomentum={false}
            onDragEnd={handleDragEnd}
            style={{ position: "fixed", top: 0, left: 0 }}
          >
            {/* Top Video Area */}
            <div className="relative w-full aspect-video bg-white">
              <PiPVideoContent
                activeScreenShare={activeScreenShare}
                dominant={dominant}
              />

              {/* Top overlay */}
              <div className="absolute top-0 left-0 right-0 p-2 px-3 bg-gradient-to-b from-black/55 to-transparent flex items-center justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="text-[11px] font-semibold text-white drop-shadow-md max-w-[60%] truncate">{roomName}</span>
                {formattedElapsed && formattedElapsed !== "00:00" && (
                  <span className="text-[10px] font-medium text-white/85 bg-black/35 px-1.5 py-0.5 rounded-md tabular-nums">{formattedElapsed}</span>
                )}
              </div>
            </div>

            {/* Bottom Controls Area */}
            <PiPControlBar
              micOn={micOn}
              cameraOn={cameraOn}
              onToggleMic={handleToggleMic}
              onToggleCam={handleToggleCam}
              onReturnToCall={returnToCall}
              onLeave={handleLeaveSession}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default PiPWidget
