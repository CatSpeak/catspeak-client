import VideoTile from "@/features/video-call/components/VideoTile"

/**
 * Compact strip of camera tiles shown alongside the watch-together media
 * spotlight, so participants remain visible while everyone watches (decision:
 * "media spotlight replaces the grid — camera tiles collapse to a side strip").
 */
const MediaParticipantStrip = ({ participants }) => {
  const visible = (participants || [])
    .filter((p) => p.isLocal || p.isCameraEnabled)
    .slice(0, 6)

  if (visible.length === 0) return null

  return (
    <div className="absolute bottom-3 right-3 flex flex-col gap-1.5 pointer-events-auto z-20">
      {visible.map((p) => (
        <div
          key={p.identity}
          className="h-16 w-24 rounded-lg overflow-hidden border border-white/20 shadow-md bg-neutral-900"
        >
          <VideoTile participant={p} />
        </div>
      ))}
    </div>
  )
}

export default MediaParticipantStrip
