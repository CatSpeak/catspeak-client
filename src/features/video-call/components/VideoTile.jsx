import { MicOff, VideoOff, MonitorUp, Hand } from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import { useState, useEffect, useRef, useReducer, useMemo } from "react"
import { useIsSpeaking } from "@livekit/components-react"
import { Track, ParticipantEvent, TrackEvent } from "livekit-client"
import { motion } from "framer-motion"

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

import { useGlobalVideoCall as useVideoCallContext } from "@/features/video-call/context/GlobalVideoCallProvider"
import { isRoomHost } from "@/features/video-call/utils/roomTypeHelpers"

/**
 * Renders a single participant's video tile using LiveKit.
 *
 * Subscribes to participant track events so that when tracks are
 * renegotiated (e.g. during screen-share) the audio/video elements
 * are re-attached to the current, live track objects.
 *
 * @param {{ participant: import('livekit-client').Participant }} props
 */
const VideoTileInner = ({ participant, onClick, compact = false }) => {
  const { t } = useLanguage()
  const isSpeaking = useIsSpeaking(participant)
  const { room, user, isHost: isHostFromContext } = useVideoCallContext()
  const isHost = isHostFromContext || isRoomHost(room, user?.accountId)

  // Force re-render whenever tracks change on this participant so that
  // getTrackPublication() returns the latest track references.
  const [, forceUpdate] = useReducer((x) => x + 1, 0)

  // Also force update when the underlying LocalTrack's processor swaps
  // without changing the publication object identity (iPhone second toggle:
  // same LocalVideoTrack instance, new processedTrack). Without this the
  // VideoTile stays attached to the old ended track => black screen.
  const trackProcessorVersionRef = useRef(0)
  const [, forceProcessorUpdate] = useReducer((x) => x + 1, 0)

  useEffect(() => {
    if (!participant) return
    const events = [
      ParticipantEvent.TrackSubscribed,
      ParticipantEvent.TrackUnsubscribed,
      ParticipantEvent.TrackMuted,
      ParticipantEvent.TrackUnmuted,
      ParticipantEvent.TrackPublished,
      ParticipantEvent.TrackUnpublished,
      ParticipantEvent.LocalTrackPublished,
      ParticipantEvent.LocalTrackUnpublished,
      ParticipantEvent.MetadataChanged,
    ]

    events.forEach((evt) => participant.on?.(evt, forceUpdate))

    // Listen for processor swaps on the local camera track.
    // LiveKit fires TrackEvent.TrackProcessorUpdate when setProcessor /
    // stopProcessor completes, and TrackEvent.Restarted when the camera
    // hardware is reacquired after mute/unmute on iOS.
    const camPub = participant.getTrackPublication?.(Track.Source.Camera)
    const camTrack = camPub?.track
    const onProcessorUpdate = () => {
      trackProcessorVersionRef.current += 1
      forceProcessorUpdate()
      forceUpdate()
    }
    const onRestarted = () => {
      trackProcessorVersionRef.current += 1
      forceProcessorUpdate()
      forceUpdate()
    }
    camTrack?.on?.(TrackEvent.TrackProcessorUpdate, onProcessorUpdate)
    camTrack?.on?.(TrackEvent.Restarted, onRestarted)
    camTrack?.on?.(TrackEvent.Ended, onProcessorUpdate)
    // Also listen for future publications (track may not exist yet)
    const onLocalPublished = (pub) => {
      if (pub?.source === Track.Source.Camera) {
        const t = pub?.track
        t?.on?.(TrackEvent.TrackProcessorUpdate, onProcessorUpdate)
        t?.on?.(TrackEvent.Restarted, onRestarted)
        t?.on?.(TrackEvent.Ended, onProcessorUpdate)
      }
    }
    participant.on?.(ParticipantEvent.LocalTrackPublished, onLocalPublished)

    return () => {
      events.forEach((evt) => participant.off?.(evt, forceUpdate))
      camTrack?.off?.(TrackEvent.TrackProcessorUpdate, onProcessorUpdate)
      camTrack?.off?.(TrackEvent.Restarted, onRestarted)
      camTrack?.off?.(TrackEvent.Ended, onProcessorUpdate)
      participant.off?.(ParticipantEvent.LocalTrackPublished, onLocalPublished)
    }
  }, [participant])

  const displayName = participant.name || participant.identity || "?"
  const isLocal = participant.isLocal
  const micOn = participant.isMicrophoneEnabled
  const webcamOn = participant.isCameraEnabled
  const screenShareOn = participant.isScreenShareEnabled

  const parseMetadata = (metadata) => {
    if (!metadata) return {}
    try {
      return JSON.parse(metadata)
    } catch {
      return {}
    }
  }
  const meta = parseMetadata(participant.metadata)
  const isHandRaised = meta.handRaised === true
  const avatarUrl = sanitizeAvatarUrl(meta.avatarImageUrl)

  const theme = useMemo(
    () => getParticipantTheme(participant.identity),
    [participant.identity],
  )

  // Get the camera track publication
  const cameraPub = participant.getTrackPublication(Track.Source.Camera)
  const cameraTrack = cameraPub?.track
  // Detect black-screen condition: track exists but its MediaStreamTrack is
  // ended or muted at the hardware level (iPhone after second toggle before
  // processor re-attaches). In that state we must NOT show the video element
  // as it would render black; fall back to avatar until the track is live.
  const isTrackLive = (() => {
    if (!cameraTrack) return false
    try {
      const mst = cameraTrack.mediaStreamTrack
      const raw = cameraTrack._mediaStreamTrack ?? mst
      // Check both the processed track and the underlying raw track
      if (mst?.readyState === "ended" || raw?.readyState === "ended") return false
      if (mst?.muted) return false
      if (cameraTrack.isMuted) return false
      return true
    } catch {
      return !!cameraTrack
    }
  })()
  const isVideoVisible = webcamOn && (!!cameraTrack || participant.isMockCamera) && (isLocal ? isTrackLive || !!cameraTrack : true)

  const videoRef = useRef(null)

  // Attach / detach the camera track to the <video> element
  // Includes processorVersion so a same-object track with a new
  // processedTrack (LiveKit processor swap on iPhone second toggle)
  // is re-attached even though `cameraTrack` reference is unchanged.
  useEffect(() => {
    const el = videoRef.current
    if (!el) return

    if (cameraTrack && isVideoVisible) {
      try {
        cameraTrack.attach(el)
        // iOS Safari requires explicit play() after srcObject change;
        // LiveKit's attachToElement does a setTimeout fix for Safari, but
        // when the track object is reused (mute/unmute) the internal
        // `existingTracks.includes(track)` check can skip the fix. Force
        // play here to ensure the video actually renders after second toggle.
        const playPromise = el.play?.()
        if (playPromise?.catch) {
          playPromise.catch(() => {
            // Autoplay may be blocked until user gesture; retry once after
            // a short delay — this is the iPhone toggle case where the
            // processor's video element was paused.
            setTimeout(() => el.play?.().catch(() => {}), 100)
          })
        }
      } catch (e) {
        console.warn("[VideoTile] attach failed:", e)
      }
      // Safari 15/16 black-frame workaround: re-assign srcObject after a tick
      // (mirrors LiveKit's attachToElement Safari fix but ensures it runs
      // even when LiveKit thought the track was already attached).
      if (typeof navigator !== "undefined" && /^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
        const mst = cameraTrack.mediaStreamTrack
        if (mst) {
          setTimeout(() => {
            try {
              if (el.srcObject instanceof MediaStream) {
                const hasTrack = el.srcObject.getVideoTracks().includes(mst)
                if (!hasTrack && isVideoVisible) {
                  cameraTrack.attach(el)
                  el.play?.().catch(() => {})
                }
              }
            } catch {}
          }, 50)
        }
      }
    }

    return () => {
      if (cameraTrack) {
        try {
          cameraTrack.detach(el)
        } catch {}
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraTrack, isVideoVisible, trackProcessorVersionRef.current])

  return (
    <div
      onClick={onClick}
      className={getVideoTileRootClass({
        compact,
        isVideoVisible,
        clickable: !!onClick,
      })}
    >
      {/* Speaking Indicator Overlay */}
      <div
        className={`pointer-events-none absolute inset-0 z-10 rounded-xl transition-all duration-200 ${
          isSpeaking
            ? "border-2 border-solid border-[#3D9E60] ring-1 ring-inset ring-[#F5F5F7]"
            : "border-2 border-solid border-transparent shadow-sm"
        }`}
      />

      {/* Video element for real camera track OR Mock Camera Preview */}
      {isVideoVisible ? (
        participant.isMockCamera && !cameraTrack ? (
          <div className="relative h-full w-full bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 flex flex-col items-center justify-center p-4 select-none">
            <Avatar
              src={avatarUrl}
              name={displayName}
              size="lg"
              theme={theme}
            />
            <span className="mt-2 text-[10px] font-semibold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/30 backdrop-blur-sm animate-pulse">
              🎥 Camera (Mock)
            </span>
          </div>
        ) : (
          <video
            autoPlay
            playsInline
            muted={isLocal}
            ref={videoRef}
            className={`h-full w-full object-cover ${
              isVideoVisible ? "block" : "hidden"
            } ${isLocal ? "transform -scale-x-100" : ""}`}
          />
        )
      ) : null}

      {/* Avatar fallback when no video */}
      {!isVideoVisible && (
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
                className="absolute inset-0 z-0 h-full w-full object-cover blur-[40px] scale-125 opacity-60"
                onError={(e) => {
                  e.target.style.display = "none"
                  e.target.previousSibling.style.display = "none"
                }}
              />
            </>
          )}
          <div
            className={`${avatarUrl ? "relative z-10" : ""} flex items-center justify-center`}
          >
            <Avatar
              size={getVideoTileAvatarSize({ compact })}
              name={displayName || "?"}
              src={avatarUrl}
              speaking={false}
              accountId={
                meta.accountId ||
                (/^\d+$/.test(participant.identity) ? participant.identity : null)
              }
              className={`${getVideoTileAvatarClass({ compact })} ${
                avatarUrl ? "shadow-xl" : ""
              } ${theme.avatarClass}`}
            />
          </div>
        </div>
      )}

      {/* Bottom Controls Overlay */}
      <div className={getVideoTileOverlayBarClass({ compact })}>
        {/* Status icons and Name */}
        <div className={getVideoTileOverlayPillClass({ compact })}>
          <div className="flex flex-shrink-0 items-center gap-1">
            {screenShareOn && <MonitorUp size={14} className="sm:w-4 sm:h-4" />}
            {!micOn && <MicOff size={14} className="sm:w-4 sm:h-4" />}
            {!webcamOn && <VideoOff size={14} className="sm:w-4 sm:h-4" />}
          </div>
          <div
            onClick={(e) => {
              const accountId =
                meta.accountId ||
                (/^\d+$/.test(participant.identity) ? participant.identity : null)
              if (accountId) {
                e.stopPropagation()
                window.open(
                  getProfilePath(accountId),
                  "_blank",
                  "noopener,noreferrer",
                )
              }
            }}
            className={`${getVideoTileOverlayNameClass({ compact })} ${
              meta.accountId || /^\d+$/.test(participant.identity)
                ? "cursor-pointer hover:underline"
                : ""
            }`}
          >
            {displayName}{" "}
            {isLocal &&
              (t.rooms?.videoCall?.participantList?.youSuffix || "(You)")}
          </div>
        </div>

        {/* Raised Hand Icon */}
        {isHandRaised && (
          <div className="flex shrink-0 h-9 w-9 items-center justify-center rounded-full bg-yellow-500/90 text-white shadow-md backdrop-blur-sm pointer-events-auto">
            <motion.div
              animate={{ rotate: [0, 20, -10, 20, -10, 0] }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: "easeInOut",
                repeatDelay: 1,
              }}
              style={{ originX: 0.7, originY: 0.7 }}
              className="flex flex-shrink-0 items-center justify-center"
            >
              <Hand size={16} />
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

const VideoTile = (props) => {
  if (!props?.participant) return null
  return <VideoTileInner {...props} />
}

export default VideoTile
