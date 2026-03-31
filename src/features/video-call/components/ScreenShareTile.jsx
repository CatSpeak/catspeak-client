import { useEffect, useRef, useCallback } from "react"
import { MonitorUp } from "lucide-react"

/**
 * Renders a shared screen in a <video> element.
 * Uses object-contain to preserve the screen's native aspect ratio.
 *
 * @param {{ screenShareStream: MediaStream | null, presenterDisplayName: string, isLocal: boolean }} props
 */
const ScreenShareTile = ({ screenShareStream, presenterDisplayName, isLocal }) => {
  const videoRef = useRef(null)

  const attemptPlay = useCallback(async (el) => {
    if (!el || !el.paused) return
    try {
      await el.play()
    } catch (err) {
      if (err.name !== "AbortError") {
        console.warn("[ScreenShareTile] play() failed:", err.name, err.message)
      }
    }
  }, [])

  useEffect(() => {
    const el = videoRef.current
    if (!el) return

    el.srcObject = screenShareStream ?? null

    if (screenShareStream) {
      attemptPlay(el)
    }
  }, [screenShareStream, attemptPlay])

  const label = isLocal
    ? `${presenterDisplayName}'s screen (You)`
    : `${presenterDisplayName}'s screen`

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-lg border border-[#C6C6C6] bg-neutral-900 shadow-sm">
      <video
        autoPlay
        playsInline
        muted
        ref={videoRef}
        className="h-full w-full object-contain"
      />

      {/* Label overlay */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-md bg-black/60 px-3 py-1.5 text-sm font-medium text-white">
        <MonitorUp size={16} />
        <span>{label}</span>
      </div>
    </div>
  )
}

export default ScreenShareTile
