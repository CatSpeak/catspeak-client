import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react"
import { TriangleAlert, MousePointerClick } from "lucide-react"

let iframeApiPromise = null

/**
 * Loads the YouTube IFrame Player API exactly once per page (the API calls
 * back on window.onYouTubeIframeAPIReady when it is done).
 */
const loadYouTubeIframeApi = () => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("YouTube player requires a browser."))
  }
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (!iframeApiPromise) {
    iframeApiPromise = new Promise((resolve, reject) => {
      const previous = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        if (typeof previous === "function") {
          try {
            previous()
          } catch {
            // Ignore host-page hook failures; the API itself is ready.
          }
        }
        resolve(window.YT)
      }
      const tag = document.createElement("script")
      tag.src = "https://www.youtube.com/iframe_api"
      tag.async = true
      tag.onerror = () => {
        iframeApiPromise = null
        reject(new Error("Failed to load the YouTube player API."))
      }
      document.head.appendChild(tag)
    })
  }
  return iframeApiPromise
}

/**
 * SyncedYouTubePlayer — a chromeless YouTube video controllable over JS for
 * watch-sync.
 *
 * Unlike the mute chat embed, this wraps the IFrame Player API so the room
 * can play/pause/seek every viewer in sync. The player is fully chromeless
 * (controls=0): the room's WatchTogetherToolbar below the video is the only
 * control surface, so host gestures always flow through the sync publisher.
 * All sync decisions live in useSyncedPlayer; this component only owns the
 * player instance plus two overlays: the tap-to-sync gate (autoplay policy)
 * and the per-viewer error card (embed blocked vs generic failure). Copy
 * comes from the four locales; Vietnamese is the fallback. The `videoId`
 * prop auto-cues on mount/change (covers the host, whose copy is driven by
 * the custom toolbar, and viewers whose player mounts after a load arrives).
 *
 * The title is NOT rendered here — VideoCallRoom shows it below the video
 * (YouTube-app style).
 */
const SyncedYouTubePlayer = forwardRef(
  (
    {
      needsTapToSync = false,
      onTapToSync = null,
      onError = null,
      syncError = null,
      videoId = null,
      t = null,
      className = "",
    },
    ref,
  ) => {
    const mountRef = useRef(null)
    const playerRef = useRef(null)
    const readyRef = useRef(false)
    const pendingVideoRef = useRef(null)
    const callbacksRef = useRef({})
    useEffect(() => {
      callbacksRef.current.onError = onError
    }, [onError])

    const strings = t?.rooms?.videoCall?.watchTogether ?? {}
    const tapLabel = strings.tapToSync || "Nhấn để đồng bộ"
    const embedBlockedLabel =
      strings.embedBlocked || "Video này không cho phép phát chung."
    const syncErrorLabel =
      strings.syncError || "Không thể tải video. Kiểm tra kết nối rồi thử lại."

    // Create/destroy the player with the mount (StrictMode-safe).
    useEffect(() => {
      let cancelled = false
      let player = null

      loadYouTubeIframeApi()
        .then((YT) => {
          if (cancelled || !mountRef.current) return
          player = new YT.Player(mountRef.current, {
            width: "100%",
            height: "100%",
            playerVars: {
              rel: 0,
              playsinline: 1,
              modestbranding: 1,
              enablejsapi: 1,
              controls: 0,
              disablekb: 1,
              fs: 0,
              iv_load_policy: 3,
              origin:
                typeof window !== "undefined" ? window.location.origin : undefined,
            },
            events: {
              onReady: () => {
                readyRef.current = true
                if (pendingVideoRef.current) {
                  try {
                    player.cueVideoById(pendingVideoRef.current)
                  } catch {
                    // Player torn down mid-ready; teardown below cleans up.
                  }
                  pendingVideoRef.current = null
                }
              },
              onError: (event) => {
                callbacksRef.current.onError?.(event?.data)
              },
            },
          })
          playerRef.current = player
        })
        .catch(() => {
          callbacksRef.current.onError?.("api-load-failed")
        })

      return () => {
        cancelled = true
        readyRef.current = false
        pendingVideoRef.current = null
        try {
          playerRef.current?.destroy?.()
        } catch {
          // Already gone (StrictMode remount); nothing to clean.
        }
        playerRef.current = null
      }
    }, [])

    // Auto-cue when a video is (first) supplied or swapped — survives the
    // player not being ready yet via pendingVideoRef. This is the load path
    // for the host (custom toolbar) and a safe complement for viewers whose
    // machine already cued the same id.
    useEffect(() => {
      if (!videoId) return
      if (readyRef.current && playerRef.current) {
        try {
          playerRef.current.cueVideoById(videoId)
        } catch {
          // Player torn down mid-cue; teardown below cleans up.
        }
      } else {
        pendingVideoRef.current = videoId
      }
    }, [videoId])

    useImperativeHandle(
      ref,
      () => ({
        loadVideo: (videoId) => {
          if (!videoId) return
          if (readyRef.current && playerRef.current) {
            playerRef.current.cueVideoById(videoId)
          } else {
            pendingVideoRef.current = videoId
          }
        },
        playAt: (seconds) => {
          const player = playerRef.current
          if (!player) return
          if (seconds != null) player.seekTo(seconds, true)
          player.playVideo()
        },
        pauseAt: (seconds) => {
          const player = playerRef.current
          if (!player) return
          if (seconds != null) player.seekTo(seconds, true)
          player.pauseVideo()
        },
        seekTo: (seconds) => {
          playerRef.current?.seekTo(seconds, true)
        },
        play: () => {
          playerRef.current?.playVideo()
        },
        pause: () => {
          playerRef.current?.pauseVideo()
        },
        stop: () => {
          playerRef.current?.stopVideo()
        },
        getCurrentTime: () => {
          try {
            const value = playerRef.current?.getCurrentTime?.()
            return typeof value === "number" && Number.isFinite(value)
              ? value
              : null
          } catch {
            return null
          }
        },
        getPlayerState: () => {
          try {
            const value = playerRef.current?.getPlayerState?.()
            return typeof value === "number" ? value : null
          } catch {
            return null
          }
        },
        getDuration: () => {
          try {
            const value = playerRef.current?.getDuration?.()
            return typeof value === "number" && Number.isFinite(value)
              ? value
              : null
          } catch {
            return null
          }
        },
        mute: () => {
          try {
            playerRef.current?.mute?.()
          } catch {
            // No-op when player is tearing down.
          }
        },
        unMute: () => {
          try {
            playerRef.current?.unMute?.()
          } catch {
            // No-op when player is tearing down.
          }
        },
        isMuted: () => {
          try {
            const value = playerRef.current?.isMuted?.()
            return typeof value === "boolean" ? value : null
          } catch {
            return null
          }
        },
        getVolume: () => {
          try {
            const value = playerRef.current?.getVolume?.()
            return typeof value === "number" && Number.isFinite(value)
              ? value
              : null
          } catch {
            return null
          }
        },
        setVolume: (level) => {
          try {
            playerRef.current?.setVolume?.(level)
          } catch {
            // No-op when player is tearing down.
          }
        },
      }),
      [],
    )

    return (
      <div className={`relative aspect-video w-full overflow-hidden bg-black ${className}`}>
        <div ref={mountRef} className="h-full w-full" />
        {syncError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/85 px-6 text-center text-white">
            <TriangleAlert size={28} className="text-amber-400" />
            <p className="text-sm font-medium">
              {syncError.kind === "embed-blocked"
                ? embedBlockedLabel
                : syncErrorLabel}
            </p>
          </div>
        ) : needsTapToSync ? (
          <button
            type="button"
            onClick={onTapToSync ?? undefined}
            className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-2 bg-black/60 text-white transition-colors hover:bg-black/50"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 shadow-lg">
              <MousePointerClick size={26} />
            </span>
            <span className="text-sm font-medium">{tapLabel}</span>
          </button>
        ) : null}
      </div>
    )
  },
)

SyncedYouTubePlayer.displayName = "SyncedYouTubePlayer"

export default SyncedYouTubePlayer
