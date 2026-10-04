import { useState, useEffect, useRef, useReducer, useMemo } from "react"
import { useIsSpeaking } from "@livekit/components-react"
import { Track } from "livekit-client"
import { MicOff, VideoOff, MonitorUp } from "lucide-react"
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
import { useLanguage } from "@/shared/context/LanguageContext"
import { getProfilePath } from "@/shared/utils/navigation"

/**
 * ParticipantVideoTile — Renders camera video or ambient blurred avatar fallback
 * for each participant, with a centralized speaking indicator and status badges.
 */
const ParticipantVideoTile = ({
  participant,
  isLocal = false,
  isSolo = false,
  isInitiator = false,
  conversation,
  currentUser,
}) => {
  const { t } = useLanguage()
  const videoRef = useRef(null)
  const isSpeaking = useIsSpeaking(participant)
  const [, forceUpdate] = useReducer((x) => x + 1, 0)
  const [hasVideo, setHasVideo] = useState(false)

  const isLocalUser = isLocal || participant?.isLocal

  const parseMetadata = (metadata) => {
    if (!metadata) return {}
    try {
      return JSON.parse(metadata)
    } catch {
      return {}
    }
  }

  const meta = parseMetadata(participant?.metadata)
  const metaAvatar = sanitizeAvatarUrl(meta.avatarImageUrl || meta.avatar)

  const groupParticipant = conversation?.participants?.find(
    (p) =>
      String(p.id || p.accountId) === String(participant?.identity) ||
      String(p.username) === String(participant?.name || participant?.identity),
  )

  const resolvedAvatar =
    metaAvatar ||
    (isLocalUser
      ? currentUser?.avatarImageUrl || currentUser?.avatar
      : groupParticipant?.avatarImageUrl ||
        groupParticipant?.avatar ||
        conversation?.friend?.avatarImageUrl ||
        conversation?.friend?.avatar)

  const displayName =
    participant?.name ||
    groupParticipant?.username ||
    (isLocalUser
      ? currentUser?.username || "You"
      : conversation?.friend?.username || participant?.identity || "User")

  const theme = useMemo(
    () => getParticipantTheme(participant?.identity || displayName),
    [participant?.identity, displayName],
  )

  const micOn = participant?.isMicrophoneEnabled
  const screenShareOn = participant?.isScreenShareEnabled

  const targetAccountId =
    meta.accountId ||
    groupParticipant?.id ||
    groupParticipant?.accountId ||
    (conversation?.friend && !isLocalUser
      ? conversation.friend.id || conversation.friend.accountId
      : null) ||
    (/^\d+$/.test(participant?.identity) ? participant.identity : null)

  useEffect(() => {
    if (!participant) return

    let currentTrack = null
    const videoEl = videoRef.current

    const checkTrack = () => {
      const pubs = Array.from(participant.videoTrackPublications.values())
      // Prefer ScreenShare track over Camera track if present
      const screenPub = pubs.find(
        (p) => p.source === Track.Source.ScreenShare && !p.isMuted && p.track,
      )
      const camPub = pubs.find(
        (p) => p.source === Track.Source.Camera && !p.isMuted && p.track,
      )
      const targetPub =
        screenPub || camPub || pubs.find((p) => !p.isMuted && p.track)

      if (targetPub && targetPub.track) {
        currentTrack = targetPub.track
        if (videoEl) {
          currentTrack.attach(videoEl)
          setHasVideo(true)
        }
      } else {
        setHasVideo(false)
      }
      forceUpdate()
    }

    checkTrack()

    // Listen to track state & metadata changes
    participant.on("trackSubscribed", checkTrack)
    participant.on("trackUnsubscribed", checkTrack)
    participant.on("trackMuted", checkTrack)
    participant.on("trackUnmuted", checkTrack)
    participant.on("trackPublished", checkTrack)
    participant.on("trackUnpublished", checkTrack)
    participant.on("isMutedChanged", checkTrack)

    return () => {
      participant.off("trackSubscribed", checkTrack)
      participant.off("trackUnsubscribed", checkTrack)
      participant.off("trackMuted", checkTrack)
      participant.off("trackUnmuted", checkTrack)
      participant.off("trackPublished", checkTrack)
      participant.off("trackUnpublished", checkTrack)
      participant.off("isMutedChanged", checkTrack)
      if (currentTrack && videoEl) {
        try {
          currentTrack.detach(videoEl)
        } catch {
          // Ignore detach errors if element or track is already torn down
        }
      }
    }
  }, [participant])

  return (
    <div
      className={`${getVideoTileRootClass({
        isVideoVisible: hasVideo,
      })} border border-white/10 bg-neutral-900`}
    >
      {/* Speaking Indicator Overlay (Dark-mode emerald glow without light-mode white ring) */}
      <div
        className={`pointer-events-none absolute inset-0 z-10 rounded-xl transition-all duration-200 ${
          isSpeaking
            ? "border-2 border-solid border-emerald-500 ring-1 ring-inset ring-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.35)]"
            : "border-2 border-solid border-transparent"
        }`}
      />

      {/* Real camera or screen share video element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocalUser}
        className={`h-full w-full object-cover ${hasVideo ? "block" : "hidden"} ${
          isLocalUser ? "transform -scale-x-100" : ""
        }`}
      />

      {/* Ambient blurred backdrop + Avatar when camera is off */}
      {!hasVideo && (
        <div
          className={`flex h-full w-full items-center justify-center ${resolvedAvatar ? "relative overflow-hidden" : ""}`}
          style={{ background: theme.bg }}
        >
          {resolvedAvatar && (
            <>
              <div className="absolute inset-0 z-0 bg-neutral-900" />
              <img
                src={resolvedAvatar}
                alt=""
                className="absolute inset-0 z-0 h-full w-full object-cover blur-[40px] scale-125 opacity-60 select-none pointer-events-none"
                onError={(e) => {
                  e.currentTarget.style.display = "none"
                }}
              />
            </>
          )}

          <div
            className={`${resolvedAvatar ? "relative z-10" : ""} flex flex-col items-center justify-center`}
          >
            <Avatar
              size={getVideoTileAvatarSize()}
              name={displayName}
              src={resolvedAvatar}
              className={`${getVideoTileAvatarClass()} ${
                resolvedAvatar ? "shadow-xl" : ""
              } ${theme.avatarClass}`}
            />

            {/* Solo Waiting Notice (Only for group calls when alone) */}
            {isSolo && isInitiator && (
              <div className="mt-3 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-xs text-neutral-300 shadow-md animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>
                  {t?.chat?.call?.waitingForOthers ||
                    "Waiting for others to join..."}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Controls Overlay */}
      <div className={getVideoTileOverlayBarClass()}>
        {/* Status icons and Name */}
        <div className={getVideoTileOverlayPillClass()}>
          <div className="flex flex-shrink-0 items-center gap-1">
            {screenShareOn && (
              <MonitorUp size={14} className="sm:w-4 sm:h-4 text-yellow-400" />
            )}
            {!micOn && (
              <MicOff size={14} className="sm:w-4 sm:h-4 text-red-400" />
            )}
            {!hasVideo && (
              <VideoOff size={14} className="sm:w-4 sm:h-4 text-neutral-400" />
            )}
          </div>
          <div
            onClick={(e) => {
              if (targetAccountId) {
                e.stopPropagation()
                window.open(
                  getProfilePath(targetAccountId),
                  "_blank",
                  "noopener,noreferrer",
                )
              }
            }}
            className={`${getVideoTileOverlayNameClass()} ${
              targetAccountId ? "cursor-pointer hover:underline" : ""
            }`}
          >
            <span className="truncate max-w-[140px]">{displayName}</span>
            {isLocalUser && (
              <span className="text-neutral-400 text-xs ml-1 font-normal">
                {t?.rooms?.videoCall?.participantList?.youSuffix || "(You)"}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ParticipantVideoTile
