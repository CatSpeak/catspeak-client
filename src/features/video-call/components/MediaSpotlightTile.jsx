import { useState, useEffect, useRef } from "react"
import { Youtube, Volume2, VolumeX, Expand } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import { isRoomHost } from "@/features/video-call/utils/roomTypeHelpers"
import { parseMetadata } from "@/features/video-call/hooks/useParticipantList"

/**
 * Renders the shared watch-together video track published by LiveKit Ingress.
 * Uses track.attach() to display the stream, mirroring ScreenShareTile.
 *
 * @param {{ trackRef: import('@livekit/components-react').TrackReferenceOrPlaceholder, title: string, onStop: () => void }} props
 */
const MediaSpotlightTile = ({ trackRef, title, onStop }) => {
  const videoRef = useRef(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const { t } = useLanguage()
  const { room, user, isHost: isHostFromContext } = useGlobalVideoCall()
  const isHost = isHostFromContext || isRoomHost(room, user?.accountId)

  const participant = trackRef?.participant

  // Toggle mute on the media participant's audio track.
  const toggleMute = (e) => {
    e.stopPropagation()
    const next = !isMuted
    if (participant && !participant.isLocal) {
      participant.audioTrackPublications?.forEach((pub) => {
        if (pub.track && typeof pub.track.setVolume === "function") {
          pub.track.setVolume(next ? 0 : 1)
        }
      })
    }
    setIsMuted(next)
  }

  const toggleFullscreen = (e) => {
    e.stopPropagation()
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {})
    } else {
      document.exitFullscreen?.()
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  // Attach/detach the media video track.
  useEffect(() => {
    const el = videoRef.current
    const track = trackRef?.publication?.track
    if (!el || !track) return
    track.attach(el)
    return () => {
      track.detach(el)
    }
  }, [trackRef?.publication?.track])

  const meta = parseMetadata(participant?.metadata)
  const resolvedTitle = title || meta?.title || "YouTube"

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-black">
      <video
        autoPlay
        playsInline
        ref={videoRef}
        className="h-full w-full object-contain"
      />

      {/* Top bar */}
      <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1 pointer-events-none">
        <div
          className="flex min-w-0 items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 text-white backdrop-blur-sm pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <Youtube size={16} className="text-red-500 shrink-0" />
          <span className="min-w-0 truncate font-medium text-sm">
            {resolvedTitle}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 pointer-events-auto">
          <button
            onClick={toggleMute}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm transition-colors"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <button
            onClick={toggleFullscreen}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            <Expand size={18} />
          </button>
        </div>
      </div>

      {/* Bottom stop control (host-only) */}
      {isHost && onStop && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-auto">
          <button
            onClick={onStop}
            className="flex items-center gap-1.5 rounded-full bg-red-600/90 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
          >
            {t?.rooms?.videoCall?.watchTogether?.stopButton || "Dừng video"}
          </button>
        </div>
      )}
    </div>
  )
}

export default MediaSpotlightTile
