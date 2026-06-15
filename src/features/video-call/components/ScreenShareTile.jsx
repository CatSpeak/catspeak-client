import { useState, useEffect, useRef } from "react"
import { MonitorUp, Maximize, Minimize, Volume2, VolumeX } from "lucide-react"
import Slider from "@/shared/components/ui/Slider"

import { Track } from "livekit-client"
import { useLanguage } from "@/shared/context/LanguageContext"

/**
 * Renders a shared screen using LiveKit track.attach().
 * Uses object-contain to preserve the screen's native aspect ratio.
 *
 * @param {{ trackRef: import('@livekit/components-react').TrackReferenceOrPlaceholder, presenterDisplayName: string, isLocal: boolean }} props
 */
const ScreenShareTile = ({
  trackRef,
  presenterDisplayName,
  isLocal,
  onClick,
}) => {
  const containerRef = useRef(null)
  const videoRef = useRef(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const idleTimerRef = useRef(null)

  const participant = trackRef?.participant

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

  const isMuted = volume <= 0.001

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-neutral-900 shadow-sm ${
        isFullscreen ? "" : "rounded-2xl border border-[#E5E5E5]"
      } ${!isHovered && isFullscreen ? "cursor-none" : onClick ? "cursor-pointer" : ""}`}
    >
      <video
        autoPlay
        playsInline
        muted
        ref={videoRef}
        className="h-full w-full object-contain"
      />

      {/* Control Overlay */}
      <div
        className={`absolute bottom-0 left-0 right-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/80 to-transparent px-1 pb-1 pt-12 transition-opacity duration-300 pointer-events-none ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
      >
        <div 
          className="flex min-w-0 items-center gap-1.5 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex min-w-0 items-center gap-1.5 rounded-md bg-black/40 px-2 py-1 text-sm font-medium text-white backdrop-blur-sm">
            <MonitorUp size={16} className="shrink-0" />
            <span className="truncate">{labelText}</span>
          </div>

          {!isLocal && (
            <div className="flex shrink-0 items-center gap-1.5 rounded-md bg-black/40 px-2 py-1 text-sm font-medium text-white backdrop-blur-sm">
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
              <span className="hidden w-8 shrink-0 text-xs md:block">{Math.round(volume * 100)}%</span>
            </div>
          )}
        </div>

        <button
          onClick={toggleFullscreen}
          className="shrink-0 rounded-md bg-black/40 p-1 text-white hover:bg-black/60 backdrop-blur-sm transition-colors pointer-events-auto"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
        </button>
      </div>
    </div>
  )
}

export default ScreenShareTile
