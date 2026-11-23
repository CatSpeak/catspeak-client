import { useState, useEffect, useRef } from "react"
import { MonitorUp, Maximize, Minimize, Volume2, VolumeX, Pencil } from "lucide-react"
import Slider from "@/shared/components/ui/Slider"

import { Track } from "livekit-client"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import { isRoomHost } from "@/features/video-call/utils/roomTypeHelpers"
import { useGetRoomCoHostQuery } from "@/store/api/roomsApi"
import { normalizeCoHost } from "@/features/co-host/constants"
import { useScreenAnnotation } from "@/features/video-call/hooks/useScreenAnnotation"
import {
  ANNOTATION_COLORS,
  ANNOTATION_WIDTHS,
} from "@/features/video-call/utils/annotationProtocol"
import AnnotationCanvas from "./annotation/AnnotationCanvas"
import AnnotationToolbar from "./annotation/AnnotationToolbar"

/**
 * Renders a shared screen using LiveKit track.attach().
 * Uses object-contain to preserve the screen's native aspect ratio.
 *
 * `readOnly` is the default so grid/sidebar/PiP copies can show annotations
 * but never take pointer input; the spotlight pass sets it to false.
 *
 * @param {{ trackRef: import('@livekit/components-react').TrackReferenceOrPlaceholder, presenterDisplayName: string, isLocal: boolean, readOnly?: boolean }} props
 */
const ScreenShareTile = ({
  trackRef,
  presenterDisplayName,
  isLocal,
  onClick,
  readOnly = true,
}) => {
  const containerRef = useRef(null)
  const videoRef = useRef(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isAnnotating, setIsAnnotating] = useState(false)
  const [annotationTool, setAnnotationTool] = useState("mouse")
  const [annotationColor, setAnnotationColor] = useState(ANNOTATION_COLORS[0])
  const [annotationWidth, setAnnotationWidth] = useState(ANNOTATION_WIDTHS[1])
  const idleTimerRef = useRef(null)

  const participant = trackRef?.participant
  const {
    room,
    lkRoom,
    user,
    isHost: isHostFromContext,
    isPiP,
    id: roomId,
  } = useGlobalVideoCall()
  const isHost = isHostFromContext || isRoomHost(room, user?.accountId)

  const { data: coHostData } = useGetRoomCoHostQuery(roomId, {
    skip: !roomId || readOnly,
  })
  const coHost = normalizeCoHost(coHostData)
  const screenTrackSid = trackRef?.publication?.trackSid ?? null
  const isPresenter = Boolean(participant?.isLocal)
  const allowAnnotation = true // Ticket 04 wires the room policy into this seam.
  const annotation = useScreenAnnotation({
    room: lkRoom,
    screenTrackSid,
    enabled: !trackRef?.isMockScreen,
    isPrimary: !readOnly,
    isHost,
    isPresenter,
    coHost,
    accountId: user?.accountId,
    authorName:
      user?.fullName ||
      user?.username ||
      user?.nickname ||
      user?.email ||
      "Guest",
    allowAnnotation,
  })

  // Volume state (0 to 1)
  const [volume, setVolume] = useState(1)
  const [prevVolume, setPrevVolume] = useState(1)

  useEffect(() => {
    if (!participant || participant.isLocal) return
    // Initialize volume from the screen share audio track if it exists
    let initialVolume = 1
    participant.audioTrackPublications?.forEach((pub) => {
      if (pub.source === Track.Source.ScreenShareAudio && pub.track) {
        if (typeof pub.track.getVolume === "function") {
          initialVolume = pub.track.getVolume()
        }
      }
    })
    setVolume(initialVolume)
    if (initialVolume > 0) setPrevVolume(initialVolume)
  }, [participant])

  const applyVolume = (val) => {
    setVolume(val)
    if (participant && !participant.isLocal) {
      participant.audioTrackPublications?.forEach((pub) => {
        // Specifically target the screen share audio, not the user's microphone
        if (pub.source === Track.Source.ScreenShareAudio) {
          if (pub.track && typeof pub.track.setVolume === "function") {
            pub.track.setVolume(val)
          }
        }
      })
    }
  }

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value)
    applyVolume(val)
  }

  const handleToggleMute = (e) => {
    e.stopPropagation()
    if (volume <= 0.001) {
      applyVolume(prevVolume || 1)
    } else {
      setPrevVolume(volume)
      applyVolume(0)
    }
  }

  // Handle Fullscreen
  const toggleFullscreen = (e) => {
    e.stopPropagation()
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch((err) => {
        console.error("Error attempting to enable fullscreen:", err)
      })
    } else {
      document.exitFullscreen()
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  // Auto-hide controls logic
  const handleMouseMove = () => {
    setIsHovered(true)
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current)
    }
    idleTimerRef.current = setTimeout(() => {
      setIsHovered(false)
    }, 2500)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current)
    }
  }

  useEffect(() => {
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    }
  }, [])

  // Attach/detach the screen share track
  useEffect(() => {
    const el = videoRef.current
    const track = trackRef?.publication?.track

    if (!el || !track) return

    track.attach(el)

    return () => {
      track.detach(el)
    }
  }, [trackRef?.publication?.track])

  const { t } = useLanguage()

  const labelText = isLocal
    ? t.rooms.videoCall.screenShareLabelYou?.replace("{{name}}", presenterDisplayName) || `${presenterDisplayName}'s screen (You)`
    : t.rooms.videoCall.screenShareLabel?.replace("{{name}}", presenterDisplayName) || `${presenterDisplayName}'s screen`
  const annotationCopy = t.rooms?.videoCall?.annotation ?? {}

  const isMuted = volume <= 0.001

  const toggleAnnotation = (event) => {
    event.stopPropagation()
    const next = !isAnnotating
    setIsAnnotating(next)
    setAnnotationTool(next ? "pen" : "mouse")
  }

  const exitAnnotation = () => {
    setIsAnnotating(false)
    setAnnotationTool("mouse")
  }

  const canShowAnnotationButton =
    !readOnly &&
    !isPiP &&
    !trackRef?.isMockScreen &&
    annotation.canAnnotate

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-neutral-900 shadow-sm ${
        isFullscreen ? "" : "rounded-xl border border-border dark:border-darkBorder"
      } ${!isHovered && isFullscreen ? "cursor-none" : onClick ? "cursor-pointer" : ""}`}
    >
      {trackRef?.isMockScreen ? (
        <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-neutral-950 via-slate-900 to-indigo-950 p-6 text-white text-center border border-white/10 select-none">
          <div className="w-16 h-16 rounded-xl bg-indigo-600/30 flex items-center justify-center text-indigo-400 mb-3 border border-indigo-500/30 shadow-lg animate-pulse">
            <MonitorUp size={32} />
          </div>
          <h3 className="font-semibold text-base text-neutral-200">
            {labelText}
          </h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-sm">
            Màn hình trình chiếu demo (Mock Screen Share)
          </p>
        </div>
      ) : (
        <video
          autoPlay
          playsInline
          muted
          disablePictureInPicture
          ref={videoRef}
          className="h-full w-full object-contain"
        />
      )}

      {!trackRef?.isMockScreen && (
        <AnnotationCanvas
          containerRef={containerRef}
          videoRef={videoRef}
          items={annotation.items}
          liveStrokes={annotation.liveStrokes}
          readOnly={readOnly}
          canAnnotate={annotation.canAnnotate}
          tool={annotationTool}
          color={annotationColor}
          width={annotationWidth}
          showAuthorPills={!readOnly}
          onStrokeStart={annotation.beginStroke}
          onStrokePoint={annotation.extendStroke}
          onStrokeEnd={annotation.endStroke}
        />
      )}

      {/* Control Overlay */}
      <div
        className={`absolute bottom-2 left-2 right-2 z-20 flex items-center justify-between gap-1 transition-opacity duration-300 pointer-events-none ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
      >
        <div 
          className="flex min-w-0 items-center gap-2 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex max-w-[90%] items-center gap-1.5 rounded-full bg-black/40 px-3 py-2 text-white backdrop-blur-sm">
            <div className="flex flex-shrink-0 items-center gap-1">
              <MonitorUp size={16} />
            </div>
            <div className="min-w-0 truncate font-medium text-sm">
              {labelText}
            </div>
          </div>

          {!isLocal && (
            <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-black/40 px-3 py-2 text-white backdrop-blur-sm">
              <button onClick={handleToggleMute} className="shrink-0 hover:text-gray-300 transition-colors">
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <div className="hidden w-16 md:block md:w-24">
                <Slider
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={handleVolumeChange}
                  className="!h-1.5"
                />
              </div>
              <span className="hidden w-8 shrink-0 text-xs font-medium md:block">{Math.round(volume * 100)}%</span>
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {canShowAnnotationButton && (
            <button
              type="button"
              onClick={toggleAnnotation}
              aria-pressed={isAnnotating}
              title={annotationCopy.button || "Chú thích"}
              className={`pointer-events-auto flex h-9 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-sm font-medium text-white backdrop-blur-sm transition-colors sm:px-3 ${
                isAnnotating
                  ? "bg-cath-red-700 hover:bg-cath-red-800"
                  : "bg-black/40 hover:bg-black/60"
              }`}
            >
              <Pencil size={16} />
              <span className="hidden sm:inline">
                {annotationCopy.button || "Chú thích"}
              </span>
            </button>
          )}

          {!isPiP && (
            <button
              onClick={toggleFullscreen}
              className="shrink-0 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-sm transition-colors pointer-events-auto"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>
          )}
        </div>
      </div>

      {isAnnotating && !readOnly && (
        <AnnotationToolbar
          tool={annotationTool}
          color={annotationColor}
          width={annotationWidth}
          onToolChange={setAnnotationTool}
          onColorChange={setAnnotationColor}
          onWidthChange={setAnnotationWidth}
          onClearMine={annotation.clearMine}
          onExit={exitAnnotation}
        />
      )}
    </div>
  )
}

export default ScreenShareTile
