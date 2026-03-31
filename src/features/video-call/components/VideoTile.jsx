import { MicOff, VideoOff, MonitorUp } from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import useAudioLevel from "../hooks/useAudioLevel"
import { useEffect, useRef, useMemo, useCallback } from "react"
import { useParticipant } from "@videosdk.live/react-sdk"

// ─── Global: resume all blocked <video> elements on first user gesture ───
const pendingVideoElements = new Set()
let gestureListenerAttached = false

const attachGestureListener = () => {
  if (gestureListenerAttached) return
  gestureListenerAttached = true

  const resumeAll = () => {
    pendingVideoElements.forEach(async (el) => {
      if (el.paused && el.srcObject) {
        try {
          await el.play()
          console.log(
            "[VideoTile] [gesture recovery] ▶️ user gesture detected — successfully resumed a previously blocked <video> element",
          )
          pendingVideoElements.delete(el)
        } catch {
          // still blocked — leave in set for next gesture
        }
      } else {
        pendingVideoElements.delete(el)
      }
    })

    if (pendingVideoElements.size === 0) {
      document.removeEventListener("click", resumeAll, true)
      document.removeEventListener("touchstart", resumeAll, true)
      document.removeEventListener("keydown", resumeAll, true)
      gestureListenerAttached = false
    }
  }

  document.addEventListener("click", resumeAll, true)
  document.addEventListener("touchstart", resumeAll, true)
  document.addEventListener("keydown", resumeAll, true)
}

const VideoTile = ({ participantId }) => {
  const {
    displayName,
    webcamStream,
    micStream,
    webcamOn,
    micOn,
    screenShareOn,
    isLocal,
  } = useParticipant(participantId)

  const videoTrack = webcamStream?.track ?? null
  const audioTrack = micStream?.track ?? null

  const tag = `[VideoTile:${participantId?.slice(0, 6)}${isLocal ? ":local" : ""}]`

  // Build a stable MediaStream only when the underlying tracks change.
  const sdkStream = useMemo(() => {
    const tracks = []
    if (videoTrack && webcamOn) tracks.push(videoTrack)
    if (audioTrack && micOn) tracks.push(audioTrack)
    return tracks.length > 0 ? new MediaStream(tracks) : null
  }, [videoTrack, audioTrack, micOn, webcamOn])

  const audioLevel = useAudioLevel(audioTrack)
  const isSpeaking = micOn && audioLevel > 5

  const videoRef = useRef(null)
  const hasVideoTrack = sdkStream && sdkStream.getVideoTracks().length > 0
  const isVideoVisible = webcamOn && hasVideoTrack

  // ─── Diagnostic: log SDK state whenever mic/webcam/stream changes ───
  useEffect(() => {
    const audioState = audioTrack
      ? `readyState=${audioTrack.readyState} enabled=${audioTrack.enabled} muted=${audioTrack.muted}`
      : "not available"
    const videoState = videoTrack
      ? `readyState=${videoTrack.readyState} enabled=${videoTrack.enabled}`
      : "not available"

    console.log(
      `${tag} [SDK state change] ` +
        `mic=${micOn ? "ON" : "OFF"} (track: ${audioState}) | ` +
        `cam=${webcamOn ? "ON" : "OFF"} (track: ${videoState}) | ` +
        `MediaStream=${sdkStream ? `active with ${sdkStream.getTracks().length} track(s)` : "none"}`,
    )
  }, [sdkStream, micOn, webcamOn]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Diagnostic: monitor remote audio track WebRTC lifecycle events ───
  useEffect(() => {
    if (!audioTrack || isLocal) return

    const onEnded = () =>
      console.warn(
        `${tag} [WebRTC audio track ended] ⚠️ remote audio track has ended ` +
          `(readyState=${audioTrack.readyState}) — no more audio data will arrive`,
      )
    const onMute = () =>
      console.warn(
        `${tag} [WebRTC audio track muted] ⚠️ remote peer's audio is muted ` +
          `at the media level — track exists but is not delivering audio data`,
      )
    const onUnmute = () =>
      console.log(
        `${tag} [WebRTC audio track unmuted] ✅ remote peer's audio is now ` +
          `delivering data — audio should be audible`,
      )

    audioTrack.addEventListener("ended", onEnded)
    audioTrack.addEventListener("mute", onMute)
    audioTrack.addEventListener("unmute", onUnmute)

    return () => {
      audioTrack.removeEventListener("ended", onEnded)
      audioTrack.removeEventListener("mute", onMute)
      audioTrack.removeEventListener("unmute", onUnmute)
    }
  }, [audioTrack, isLocal]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Assign srcObject + attempt play with autoplay-block recovery ───
  const attemptPlay = useCallback(
    async (el) => {
      if (!el || el.paused === false) return
      try {
        await el.play()
        console.log(
          `${tag} [<video> play()] ▶️ play() call succeeded — browser is now playing media`,
        )
        pendingVideoElements.delete(el)
      } catch (err) {
        if (err.name === "NotAllowedError") {
          console.warn(
            `${tag} [<video> play() blocked] ⚠️ browser autoplay policy prevented playback — ` +
              `element queued for retry on next user gesture (click/touch/keydown)`,
          )
          // Register this element to be resumed on next user gesture
          pendingVideoElements.add(el)
          attachGestureListener()
        } else {
          console.error(
            `${tag} [<video> play() failed] ❌ unexpected error: ${err.name} — ${err.message}`,
          )
        }
      }
    },
    [tag],
  )

  useEffect(() => {
    const el = videoRef.current
    if (!el) return

    el.srcObject = sdkStream ?? null
    console.log(
      `${tag} [srcObject assigned] <video>.srcObject ${sdkStream ? "set to new MediaStream" : "cleared to null"} — ` +
        `audio tracks: ${sdkStream?.getAudioTracks().length ?? 0}, ` +
        `video tracks: ${sdkStream?.getVideoTracks().length ?? 0}`,
    )

    if (sdkStream && !isLocal) {
      attemptPlay(el)
    }
  }, [sdkStream, isLocal, attemptPlay, tag])

  // ─── Diagnostic: detect if <video> stops playing unexpectedly ───
  useEffect(() => {
    const el = videoRef.current
    if (!el || isLocal) return

    const onPause = () => {
      if (el.srcObject) {
        console.warn(
          `${tag} [<video> unexpected pause] ⏸️ the <video> element paused while srcObject is still set — ` +
            `attempting to resume playback automatically`,
        )
        attemptPlay(el)
      }
    }
    const onStalled = () =>
      console.warn(
        `${tag} [<video> stalled] ⏳ browser is trying to fetch media data but it is not forthcoming`,
      )
    const onPlaying = () =>
      console.log(
        `${tag} [<video> playing] ▶️ the <video> element is now actively playing media`,
      )

    el.addEventListener("pause", onPause)
    el.addEventListener("stalled", onStalled)
    el.addEventListener("playing", onPlaying)

    return () => {
      el.removeEventListener("pause", onPause)
      el.removeEventListener("stalled", onStalled)
      el.removeEventListener("playing", onPlaying)
    }
  }, [isLocal, attemptPlay, tag])

  // ─── Cleanup: remove from pending set on unmount ───
  useEffect(() => {
    return () => {
      if (videoRef.current) pendingVideoElements.delete(videoRef.current)
    }
  }, [])

  return (
    <div
      className={`relative h-full w-full min-h-[150px] overflow-hidden rounded-lg bg-white border border-solid transition-[border-color,box-shadow] duration-200 ease-in-out ${
        isSpeaking
          ? "border-green-600 shadow-[0_0_15px_rgba(46,125,50,0.4)]"
          : "border-[#C6C6C6] shadow-sm"
      }`}
    >
      {/*
        Always render the <video> element so the browser associates it with the
        original user-gesture context (joining the call). Conditionally rendering
        it caused autoplay to be blocked when remote streams arrived later.
      */}
      <video
        autoPlay
        playsInline
        muted={isLocal}
        ref={videoRef}
        className={`h-full w-full object-cover ${
          sdkStream && isVideoVisible ? "block" : "hidden"
        }`}
        onError={() => {}}
      />

      {/* Avatar fallback when no video */}
      {(!sdkStream || !isVideoVisible) && (
        <div className="flex h-full w-full items-center justify-center">
          <Avatar
            size={64}
            name={displayName || "?"}
            speaking={isSpeaking}
            className="sm:!w-20 sm:!h-20 md:!w-24 md:!h-24"
          />
        </div>
      )}

      {/* Name + speaking indicator */}
      <div className="absolute bottom-5 left-5 flex max-w-[70%] items-center gap-2">
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium text-black">
          {displayName} {isLocal && "(You)"}
        </div>
        {isSpeaking && (
          <div className="flex h-3 items-end gap-[2px]">
            <div className="h-2 w-[3px] animate-[pulse_1s_ease-in-out_infinite] rounded-full bg-green-600" />
            <div className="h-3 w-[3px] animate-[pulse_1s_ease-in-out_infinite] rounded-full bg-green-600 delay-100" />
            <div className="h-[6px] w-[3px] animate-[pulse_1s_ease-in-out_infinite] rounded-full bg-green-600 delay-200" />
          </div>
        )}
      </div>

      {/* Mic / cam off icons */}
      <div className="absolute bottom-5 right-5 flex items-center gap-4">
        {screenShareOn && <MonitorUp className="text-yellow-500" />}
        {!micOn && <MicOff className="text-[#7A7574]" />}
        {!webcamOn && <VideoOff className="text-[#7A7574]" />}
      </div>
    </div>
  )
}

export default VideoTile
