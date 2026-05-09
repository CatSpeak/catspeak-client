import { useEffect, useRef, useCallback } from "react"
import { MonitorUp } from "lucide-react"

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
  const videoRef = useRef(null)

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

  const label = isLocal
    ? `${presenterDisplayName}'s screen (You)`
    : `${presenterDisplayName}'s screen`

  return (
    <div
      onClick={onClick}
      className={`relative flex h-full w-full items-center justify-center overflow-hidden rounded-lg border border-[#E5E5E5] bg-neutral-900 shadow-sm ${onClick ? "cursor-pointer" : ""}`}
    >
      <video
        autoPlay
        playsInline
        muted
        ref={videoRef}
        className="h-full w-full object-contain"
      />

      {/* Label overlay */}
      <div className="absolute bottom-1 left-1 flex items-center gap-2 rounded-md bg-black/60 px-3 py-1.5 text-sm font-medium text-white">
        <MonitorUp size={16} />
        <span>{label}</span>
      </div>
    </div>
  )
}

export default ScreenShareTile
