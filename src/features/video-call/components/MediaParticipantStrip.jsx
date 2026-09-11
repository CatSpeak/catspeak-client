import VideoTile from "@/features/video-call/components/VideoTile"
import { getVisibleStripParticipants } from "@/features/video-call/utils/stripParticipants"

/**
 * Compact strip of camera tiles shown below the watch-together media
 * spotlight, so participants remain visible while everyone watches.
 * Horizontal scrollable row — never overlays the video.
 */
/**
 * Compact strip of camera tiles shown below the watch-together media
 * spotlight, so participants remain visible while everyone watches.
 * Horizontal scrollable row — never overlays the video.
 */
const MediaParticipantStrip = ({ participants }) => {
  const visible = getVisibleStripParticipants(participants)

  if (visible.length === 0) return null

  return (
    <div className="flex flex-row gap-2 overflow-x-auto bg-black px-3 py-2 shrink-0 md:bg-transparent">
      {visible.map((p) => (
        <div
          key={p.identity}
          className="h-20 w-36 shrink-0 rounded-lg overflow-hidden border border-white/20 shadow-sm bg-neutral-900 md:border-border"
        >
          <VideoTile participant={p} compact />
        </div>
      ))}
    </div>
  )
}

export default MediaParticipantStrip
