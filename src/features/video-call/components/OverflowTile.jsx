import React from "react"
import Avatar from "@/shared/components/ui/Avatar"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import { sanitizeAvatarUrl } from "@/features/video-call/utils/livekitMetadataUtils"
import { getParticipantTheme } from "@/features/video-call/utils/participantTheme"

const parseMetadata = (metadata) => {
  if (!metadata) return {}
  try {
    return JSON.parse(metadata)
  } catch {
    return {}
  }
}

/**
 * Renders the "+N show more" overflow tile for grid/sidebar layouts.
 * Mimics Google Meet overflow tile, opening the participant list on click.
 *
 * @param {{
 *   overflowItems: Array,
 *   overflowCount: number,
 *   onClick?: () => void
 * }} props
 */
const OverflowTile = ({ overflowItems = [], overflowCount = 0, onClick }) => {
  const { t } = useLanguage()
  let globalCtx = null
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    globalCtx = useGlobalVideoCall()
  } catch {
    globalCtx = null
  }

  const count = overflowCount || overflowItems.length
  if (count <= 0) return null

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else if (globalCtx?.setActiveSidePanel) {
      globalCtx.setActiveSidePanel("participants")
    }
  }

  // Pick up to 3 participants from overflow to show stacked avatars
  const previewParticipants = overflowItems
    .filter((item) => item?.type === "video" && item.data)
    .slice(0, 3)
    .map((item) => item.data)

  return (
    <div
      onClick={handleClick}
      className="group relative h-full w-full min-h-[100px] overflow-hidden rounded-xl bg-neutral-900/90 border border-white/10 hover:border-white/25 hover:bg-neutral-800/90 transition-all duration-200 cursor-pointer shadow-lg backdrop-blur-md flex flex-col items-center justify-center p-3 select-none [container-type:inline-size]"
      title={t.rooms?.videoCall?.participantList?.title || "Participants"}
    >
      {/* Subtle radial glow background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-50 group-hover:opacity-80 transition-opacity pointer-events-none" />

      {/* Stacked Avatar Previews */}
      {previewParticipants.length > 0 && (
        <div className="flex items-center justify-center -space-x-3 mb-2 z-10">
          {previewParticipants.map((p, idx) => {
            const meta = parseMetadata(p.metadata)
            const name = p.name || p.identity || "?"
            const avatarUrl = sanitizeAvatarUrl(meta.avatarImageUrl)
            const theme = getParticipantTheme(p.identity || name)

            return (
              <div
                key={p.identity || idx}
                className="relative rounded-full ring-2 ring-neutral-900 shadow-md transition-transform duration-200 group-hover:scale-105"
                style={{ zIndex: previewParticipants.length - idx }}
              >
                <Avatar
                  size={36}
                  name={name}
                  src={avatarUrl}
                  speaking={false}
                  className={`!w-8 !h-8 !text-xs ${theme.avatarClass}`}
                />
              </div>
            )
          })}
        </div>
      )}

      {/* Count & Text */}
      <div className="z-10 flex flex-col items-center text-center">
        <span className="font-bold text-white text-[clamp(1.25rem,6cqi,2.25rem)] leading-none tracking-tight group-hover:scale-105 transition-transform">
          +{count}
        </span>
        <span className="mt-1 text-xs sm:text-sm font-medium text-neutral-300 group-hover:text-white transition-colors truncate max-w-full px-2">
          {t.rooms?.videoCall?.showMore || "Xem thêm"}
        </span>
      </div>
    </div>
  )
}

export default OverflowTile
