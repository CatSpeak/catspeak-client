import { useMemo } from "react"
import { VideoOff } from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import { getParticipantTheme } from "@/features/video-call/utils/participantTheme"
import {
  getVideoTileRootClass,
  getVideoTileAvatarSize,
  getVideoTileAvatarClass,
  getVideoTileOverlayBarClass,
  getVideoTileOverlayPillClass,
  getVideoTileOverlayNameClass,
} from "@/features/video-call/utils/videoTileClass"
import { sanitizeAvatarUrl } from "@/features/video-call/utils/livekitMetadataUtils"

/**
 * RingingPlaceholderTile — Displays a dimmed video tile for the recipient
 * in a 1-on-1 call while waiting for them to connect (Discord-style ringing state).
 */
const RingingPlaceholderTile = ({ friend }) => {
  const theme = useMemo(
    () => getParticipantTheme(friend?.username || "friend"),
    [friend?.username],
  )
  const avatarUrl = sanitizeAvatarUrl(friend?.avatarImageUrl || friend?.avatar)
  const displayName = friend?.username || "User"

  return (
    <div
      className={`${getVideoTileRootClass({ isVideoVisible: false })} border border-white/10 bg-neutral-900 opacity-60 transition-opacity duration-300`}
    >
      {/* Ambient blurred backdrop + Avatar when waiting */}
      <div
        className={`flex h-full w-full items-center justify-center ${avatarUrl ? "relative overflow-hidden" : ""}`}
        style={{ background: theme.bg }}
      >
        {avatarUrl && (
          <>
            <div className="absolute inset-0 z-0 bg-neutral-900" />
            <img
              src={avatarUrl}
              alt=""
              className="absolute inset-0 z-0 h-full w-full object-cover blur-[40px] scale-125 opacity-60 select-none pointer-events-none"
              onError={(e) => {
                e.currentTarget.style.display = "none"
              }}
            />
          </>
        )}

        <div
          className={`${avatarUrl ? "relative z-10" : ""} flex items-center justify-center`}
        >
          <div className="relative flex items-center justify-center">
            {/* Ethereal ringing radar pulse */}
            <span className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping scale-150 duration-1000 pointer-events-none" />
            <span className="absolute inset-0 rounded-full bg-emerald-500/10 animate-pulse scale-125 pointer-events-none" />
            <Avatar
              size={getVideoTileAvatarSize()}
              name={displayName}
              src={avatarUrl}
              className={`${getVideoTileAvatarClass()} ${
                avatarUrl ? "shadow-2xl" : ""
              } ${theme.avatarClass}`}
            />
          </div>
        </div>
      </div>

      {/* Bottom Controls Overlay (Clean and identical to ParticipantVideoTile) */}
      <div className={getVideoTileOverlayBarClass()}>
        <div className={getVideoTileOverlayPillClass()}>
          <div className="flex flex-shrink-0 items-center gap-1">
            <VideoOff size={14} className="sm:w-4 sm:h-4 text-neutral-400" />
          </div>
          <div className={getVideoTileOverlayNameClass()}>
            <span className="truncate max-w-[140px]">{displayName}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RingingPlaceholderTile
