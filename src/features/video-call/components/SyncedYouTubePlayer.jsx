import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react"
import { TriangleAlert, MousePointerClick, Play } from "lucide-react"
import { buildWatchPlayerVars } from "@/features/video-call/utils/watchPlayerVars"
import {
  applyWatchCcPreference,
  disableWatchCaptions,
  enableWatchCaptions,
  getWatchCaptionTracks,
  readWatchCcEnabled,
} from "@/features/video-call/utils/watchPlayerVars"
import { YT_PLAYER_STATE } from "@/features/video-call/utils/hostSync"

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
      onStateChange = null,
      showCenterPlay = false,
      onCenterPlay = null,
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
    useEffect(() => {
      callbacksRef.current.onStateChange = onStateChange
    }, [onStateChange])

    const strings = t?.rooms?.videoCall?.watchTogether ?? {}
    const tapLabel = strings.tapToSync || "Nhấn để đồng bộ"
    const tapPlayLabel = strings.play || "Phát"
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
            playerVars: buildWatchPlayerVars(
              typeof window !== "undefined" ? window.location.origin : undefined,
            ),
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
                // NOTE: no captions call here. load/unload before the video
                // is cued either no-ops or fires player error 2 (which the
                // room surfaces as an error card). The preference is applied
                // on CUED below, when the module actually exists.
              },
              onError: (event) => {
                // Code 2 = invalid player parameter (app-side misuse, e.g. a
                // call racing module creation). Playback continues, so it
                // must never surface as a room error card.
                if (event?.data === 2) return
                callbacksRef.current.onError?.(event?.data)
              },
              onStateChange: (event) => {
                // Local-only CC (Q6=A, Q8=A): default OFF, remembered per
                // device. Split by state (verified headless vs usRA-xASQPI):
                // - ON: seed at CUED (creation-time, disruption-free).
                //   Post-load the embed defaults captions ON anyway, and
                //   mid-playback loadModule provokes a rebuffer, so never
                //   re-assert while playing.
                // - OFF: unload on PLAYING/PAUSED, when the module is
                //   settled-present. Creation-time calls (onReady/CUED/
                //   BUFFERING, i.e. inside the load) hit a mid-creation
                //   module: unload no-ops and the load recreates it
                //   default-ON. Every (re)load — initial play, seek,
                //   rebuffer, tap-to-sync staging — settles in PLAYING or
                //   a staged PAUSED, so these two cover all paths. A
                //   redundant unload on an absent module can fire error 2,
                //   which the onError forwarder above keeps off the card.
                if (event?.data === YT_PLAYER_STATE.CUED) {
                  if (readWatchCcEnabled()) enableWatchCaptions(player)
                } else if (
                  event?.data === YT_PLAYER_STATE.PLAYING ||
                  event?.data === YT_PLAYER_STATE.PAUSED
                ) {
                  if (!readWatchCcEnabled()) disableWatchCaptions(player)
                }
                callbacksRef.current.onStateChange?.(event?.data)
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
    // machine already cued the same id. The CC preference is (re)applied by
    // the CUED handler above, never here: applying pre-cue races module
    // creation (no-op or error 2) and cueing resets the module anyway.
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
        setCaptionsEnabled: (enabled) => {
          return applyWatchCcPreference(playerRef.current, enabled)
        },
        getCaptionTracks: () => {
          return getWatchCaptionTracks(playerRef.current)
        },
      }),
      [],
    )

    return (
      <div className={`relative aspect-video w-full overflow-hidden bg-black ${className}`}>
        <div ref={mountRef} className="h-full w-full" />
        {/* Interaction shield: transparent click-capture over the iframe so
            no native gesture (title/share/endscreen/click-to-play) can bypass
            watch-sync. Branding stays visible underneath; only clicks are
            intercepted. Tap/error gates render above it. */}
        <div data-testid="watch-shield" aria-hidden className="absolute inset-0 z-10" />
        {showCenterPlay && !syncError && !needsTapToSync ? (
          <button
            type="button"
            onClick={onCenterPlay ?? undefined}
            aria-label={tapPlayLabel}
            className="absolute inset-0 z-20 flex cursor-pointer items-center justify-center bg-black/45 backdrop-blur-[1px] transition-colors hover:bg-black/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-500"
          >
            <span className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-red-600 shadow-2xl ring-4 ring-white/20 transition-transform hover:scale-105 active:scale-95">
              <Play size={30} className="ml-1 text-white" fill="currentColor" />
            </span>
          </button>
        ) : null}
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
            className="absolute inset-0 z-20 flex cursor-pointer flex-col items-center justify-center gap-3 bg-black/65 px-6 text-center text-white backdrop-blur-[1px] transition-colors hover:bg-black/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-500"
          >
            <span className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-red-600 shadow-2xl ring-4 ring-white/20 transition-transform hover:scale-105 active:scale-95">
              <MousePointerClick size={30} />
            </span>
            <span className="text-sm font-semibold">{tapLabel}</span>
          </button>
        ) : null}
      </div>
    )
  },
)

SyncedYouTubePlayer.displayName = "SyncedYouTubePlayer"

export default SyncedYouTubePlayer
