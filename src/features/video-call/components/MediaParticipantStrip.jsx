import { Users } from "lucide-react"
import VideoTile from "@/features/video-call/components/VideoTile"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import { getVisibleStripParticipants } from "@/features/video-call/utils/stripParticipants"

/** Fixed cells per row — never scrolls; extras collapse into the +N cell. */
const STRIP_MAX_CELLS = 4
/**
 * Compact strip of camera tiles shown below the watch-together media
 * spotlight, so participants remain visible while everyone watches.
 * Fixed cell count per row (no scroll) + "+N" cell — never overlays video.
 */
/**
 * Compact strip of camera tiles shown below the watch-together media
 * spotlight, so participants remain visible while everyone watches.
 * Fixed cell count per row (no scroll) + "+N" cell — never overlays video.
 */
const MediaParticipantStrip = ({ participants }) => {
  let openParticipantList = null
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    openParticipantList = useGlobalVideoCall()?.setActiveSidePanel
  } catch {
    openParticipantList = null
  }

  const total = (participants || []).length
  // Room for the +N cell when crowded: 3 videos + 1 overflow = 4 cells.
  const visibleCount = total > STRIP_MAX_CELLS ? STRIP_MAX_CELLS - 1 : total
  const visible = getVisibleStripParticipants(participants, visibleCount)

  if (visible.length === 0) return null

  const overflowCount = total - visible.length

  return (
    <section aria-label="Đang cùng xem" className="w-full shrink-0">
      <div className="mb-2 flex items-center gap-2 px-1">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-gray-900/[0.06] text-gray-500">
          <Users size={14} />
        </span>
        <p className="text-xs font-semibold tracking-wide text-gray-500">
          Đang cùng xem · {total}
        </p>
      </div>
      {/* Responsive fixed grid — 2 cols on phones, 4 on sm+.
          Cells are aspect-video so one participant takes half a row
          (never a full-width banner); no x/y scroll ever. */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {visible.map((p) => (
          <div
            key={p.identity}
            className="aspect-video min-w-0 overflow-hidden rounded-xl bg-gray-100 shadow-sm ring-1 ring-black/10"
          >
            <VideoTile participant={p} compact />
          </div>
        ))}
        {overflowCount > 0 && (
          <button
            type="button"
            onClick={() => openParticipantList?.("participants")}
            aria-label={`Xem thêm ${overflowCount} người đang cùng xem`}
            title="Xem danh sách tham gia"
            className="flex aspect-video min-w-0 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-xl bg-neutral-900 text-white shadow-sm ring-1 ring-black/10 transition-colors hover:bg-neutral-700 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            <span className="text-xl font-bold leading-none sm:text-2xl">+{overflowCount}</span>
            <span className="text-[10px] font-medium text-neutral-300">Xem thêm</span>
          </button>
        )}
      </div>
    </section>
  )
}

export default MediaParticipantStrip
