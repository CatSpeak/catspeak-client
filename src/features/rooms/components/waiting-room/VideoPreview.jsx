import React, { useEffect, useRef, useState } from "react"
import { Mic, MicOff, Video, VideoOff, Image, Settings } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import Avatar from "@/shared/components/ui/Avatar"
import { useMeetingAvatar } from "@/features/video-call/hooks/useMeetingAvatar"

// [DIAG-v4 TEMP] On-screen orientation readout for iPhone debugging without
// devtools. Rendered ONLY when URL has ?iphonedbg=1. Shows raw track
// settings, element dims and transformer diag (window.__iphoneDiag).
// REMOVE before closing the iPhone rotation issue.
const IphoneDiagOverlay = ({ videoRef, localStream }) => {
  const [snap, setSnap] = useState(null)
  useEffect(() => {
    let alive = true
    const tick = () => {
      if (!alive) return
      try {
        const el = videoRef.current
        const t = localStream?.getVideoTracks?.()?.[0]
        const s = t?.getSettings?.() || {}
        const d = window.__iphoneDiag || null
        setSnap({
          settings: `${s.width || "?"}x${s.height || "?"} fm=${s.facingMode || "?"}`,
          el: el ? `${el.videoWidth || 0}x${el.videoHeight || 0}` : "no-el",
          in: d ? `${d.fw}x${d.fh}` : "?",
          raw: d?.rawRot ?? "?",
          eff: d?.effRot ?? "?",
          fp: d ? String(d.fp) : "?",
          out: d ? `${d.outW}x${d.outH}` : "?",
          vw: window.innerWidth,
        })
      } catch {
        /* ignore */
      }
    }
    tick()
    const iv = setInterval(tick, 500)
    return () => {
      alive = false
      clearInterval(iv)
    }
  }, [videoRef, localStream])
  if (!snap) return null
  return (
    <div className="absolute top-1 left-1 z-20 rounded bg-black/70 px-2 py-1 font-mono text-[10px] leading-tight text-lime-300">
      <div>cam:{snap.settings}</div>
      <div>el:{snap.el} win:{snap.vw}</div>
      <div>in:{snap.in} raw:{snap.raw} eff:{snap.eff} fp:{snap.fp}</div>
      <div>out:{snap.out}</div>
    </div>
  )
}

const showIphoneDiag = (() => {
  try {
    return typeof window !== "undefined" && window.location?.search?.includes("iphonedbg") === true
  } catch {
    return false
  }
})()

const VideoPreview = ({
  localStream,
  micOn,
  cameraOn,
  user,
  onToggleMic,
  onToggleCam,
  onOpenBgModal,
  onOpenSettings,
  lkVideoTrack,
}) => {
  const { t } = useLanguage()
  const videoRef = useRef(null)

  const { displayAvatar } = useMeetingAvatar(user)

  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return

    // Prefer the LiveKit track only while its underlying MediaStreamTrack is
    // still live. Attaching an ended (stopped) track is the classic "black
    // screen on second toggle" — the element keeps showing the dead track.
    const liveLkTrack =
      lkVideoTrack?.mediaStreamTrack?.readyState === "ended" ? null : lkVideoTrack

    if (liveLkTrack) {
      try {
        liveLkTrack.detach(videoElement)
      } catch {
        /* ignore */
      }
      try {
        liveLkTrack.attach(videoElement)
      } catch {
        /* ignore */
      }
      return () => {
        try {
          liveLkTrack.detach(videoElement)
        } catch {
          /* ignore */
        }
      }
    }

    // Fallback / no live processor track: detach any stale attachment, then
    // drive the element from the raw MediaStream (only if it has a live video
    // track — an audio-only or fully-stopped stream must clear the element).
    if (lkVideoTrack) {
      try {
        lkVideoTrack.detach(videoElement)
      } catch {
        /* ignore */
      }
    }
    try {
      const hasLiveVideo = (() => {
        try {
          return (localStream?.getVideoTracks() || []).some((t) => t.readyState === "live")
        } catch {
          return false
        }
      })()
      videoElement.srcObject = hasLiveVideo ? localStream : null
      if (hasLiveVideo) {
        videoElement.play?.().catch(() => {})
      }
    } catch {
      /* ignore */
    }
    return () => {
      try {
        videoElement.srcObject = null
      } catch {
        /* ignore */
      }
    }
  }, [lkVideoTrack, localStream])

  // Handle local preview muting
  useEffect(() => {
    if (videoRef.current && micOn) {
      videoRef.current.muted = true
    }
  }, [micOn])

  return (
    <div className="relative w-full max-w-[440px] lg:max-w-none flex flex-col items-center rounded-xl border border-[#F5F5F5] bg-[#FCFCFC]">
      {/* Mobile portrait: 3/4 vertical for face cam; desktop/tablet keeps 16:9 */}
      <div className="relative w-full aspect-[3/4] md:aspect-video overflow-hidden rounded-xl max-h-[65vh] md:max-h-none">
        {showIphoneDiag && (
          <IphoneDiagOverlay videoRef={videoRef} localStream={localStream} />
        )}
        {/* Video Preview */}
        {localStream && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted // Always mute local video preview purely for UI
            className={`h-full w-full rounded-xl object-cover transform -scale-x-100 ${!cameraOn ? "hidden" : ""}`}
          />
        )}

        {!cameraOn && (
          <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
            {displayAvatar && (
              <>
                <div className="absolute inset-0 z-0 bg-neutral-900" />
                <img
                  src={displayAvatar}
                  alt=""
                  className="absolute inset-0 z-0 h-full w-full object-cover blur-[40px] scale-125 opacity-60"
                  onError={(e) => {
                    e.target.style.display = "none"
                    e.target.previousSibling.style.display = "none"
                  }}
                />
              </>
            )}
            <div className="relative z-10 flex items-center justify-center">
              <Avatar
                size={64}
                src={displayAvatar}
                alt={user?.username || "User"}
                name={user?.fullName || user?.username || "User"}
                className={`md:!w-24 md:!h-24 ${displayAvatar ? "shadow-xl" : ""}`}
              />
            </div>
          </div>
        )}
      </div>

      {/* Controls Overlay */}
      <div className="flex flex-row gap-3 min-[426px]:absolute min-[426px]:bottom-4 min-[426px]:left-1/2 min-[426px]:z-10 min-[426px]:-translate-x-1/2 min-[426px]:mt-0 mt-2">
        <button
          onClick={onToggleMic}
          className={`border border-border flex h-11 w-11 items-center justify-center rounded-full transition-all duration-200 ${
            micOn
              ? "bg-cath-red-700 text-white hover:bg-[#7a000e]"
              : "bg-white hover:bg-[#E5E5E5]"
          }`}
        >
          {micOn ? <Mic /> : <MicOff />}
        </button>

        <button
          onClick={onToggleCam}
          className={`border border-border flex h-11 w-11 items-center justify-center rounded-full transition-all duration-200 ${
            cameraOn
              ? "bg-cath-red-700 text-white hover:bg-[#7a000e]"
              : "bg-white hover:bg-[#E5E5E5]"
          }`}
        >
          {cameraOn ? <Video /> : <VideoOff />}
        </button>

        <button
          onClick={onOpenBgModal}
          title={
            t?.rooms?.waitingScreen?.changeBackground || "Change Background"
          }
          className={`border border-border flex h-11 w-11 items-center justify-center rounded-full transition-all duration-200 bg-white text-gray-700 hover:bg-[#E5E5E5]`}
        >
          <Image />
        </button>

        <button
          onClick={onOpenSettings}
          title={t?.rooms?.waitingScreen?.deviceSettings || "Device Settings"}
          className={`border border-border flex h-12 w-12 items-center justify-center rounded-full transition-all duration-200 bg-white text-gray-700 hover:bg-[#E5E5E5]`}
        >
          <Settings />
        </button>
      </div>
    </div>
  )
}

export default VideoPreview
