import VideoTile from "@/features/video-call/components/VideoTile"

/**
 * Compact strip of camera tiles shown below the watch-together media
 * spotlight, so participants remain visible while everyone watches.
 * Horizontal scrollable row — never overlays the video.
 */
const MediaParticipantStrip = ({ participants }) => {
  const visible = (participants || [])
    .filter((p) => p.isLocal || p.isCameraEnabled)
    .slice(0, 6)

  if (visible.length === 0) return null

  return (
    <div className="flex flex-row gap-2 overflow-x-auto bg-black px-3 py-2 shrink-0 md:bg-transparent">
      {visible.map((p) => (
        <div
          key={p.identity}
          className="h-16 w-28 shrink-0 rounded-lg overflow-hidden border border-white/20 shadow-sm bg-neutral-900 md:border-border"
        >
          <VideoTile participant={p} />
        </div>
      ))}
    </div>
  )
}

export default MediaParticipantStrip
