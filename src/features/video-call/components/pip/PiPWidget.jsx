import React from "react"
import { useSelector } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"

import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import { useDominantSpeaker } from "@/features/video-call/hooks/useDominantSpeaker"
import { useSessionTimer } from "@/features/video-call/hooks/useSessionTimer"
import { usePiPDrag } from "@/features/video-call/hooks/usePiPDrag"
import { usePiPUnread } from "@/features/video-call/hooks/usePiPUnread"
import { useLanguage } from "@/shared/context/LanguageContext"

import PiPVideoContent from "./PiPVideoContent"
import PiPControlBar from "./PiPControlBar"

import "./PiPWidget.css"

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
    messages,
    handleToggleMic,
    handleToggleCam,
    handleLeaveSession,
    returnToCall,
    screenShareTracks,
  } = useGlobalVideoCall()

  const { t } = useLanguage()
  const dominant = useDominantSpeaker(participants, localParticipant)
  const { formattedElapsed } = useSessionTimer(session)
  const unreadCount = usePiPUnread(messages, isPiP)
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
            className="pip-widget"
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
            <PiPVideoContent
              activeScreenShare={activeScreenShare}
              dominant={dominant}
            />

            {/* Top overlay */}
            <div className="pip-top-overlay">
              <span className="pip-room-name">{roomName}</span>
              {formattedElapsed && formattedElapsed !== "00:00" && (
                <span className="pip-timer">{formattedElapsed}</span>
              )}
            </div>

            <PiPControlBar
              micOn={micOn}
              cameraOn={cameraOn}
              unreadCount={unreadCount}
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
