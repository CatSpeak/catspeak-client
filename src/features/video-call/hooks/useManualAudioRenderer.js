import { useEffect, useRef } from "react"
import { useRoomContext } from "@livekit/components-react"
import { RoomEvent, Track } from "livekit-client"

const P = "[ManualAudio]"

/**
 * Custom audio renderer that replaces LiveKit's `<RoomAudioRenderer>`.
 *
 * Creates and manages `<audio>` elements **imperatively via the DOM**
 * instead of through React rendering. This fixes audio playback in
 * in-app WebView browsers (Zalo, Messenger, LINE, etc.) where React-
 * managed `<audio>` elements silently fail after track renegotiation.
 *
 * How it works:
 *  - Listens to TrackSubscribed / TrackUnsubscribed room events
 *  - On subscribe: creates a DOM `<audio>`, attaches the MediaStream,
 *    calls `.play()` with retry logic
 *  - On unsubscribe: removes the `<audio>` from the DOM
 *  - Keeps a Map<trackSid, HTMLAudioElement> for cleanup
 *
 * Safe on all platforms — desktop browsers work identically.
 */
export const useManualAudioRenderer = () => {
  const room = useRoomContext()

  // Map of trackSid → HTMLAudioElement for cleanup
  const audioElementsRef = useRef(new Map())
  // Hidden container for audio elements (lives outside React tree)
  const containerRef = useRef(null)

  // ── Create / destroy the hidden container ──
  useEffect(() => {
    const container = document.createElement("div")
    container.id = "manual-audio-renderer"
    container.style.display = "none"
    document.body.appendChild(container)
    containerRef.current = container

    return () => {
      // Cleanup all audio elements
      audioElementsRef.current.forEach((el, sid) => {
        cleanupAudioElement(el, sid)
      })
      audioElementsRef.current.clear()
      container.remove()
      containerRef.current = null
    }
  }, [])

  // ── Attach existing remote audio tracks on mount / reconnect ──
  useEffect(() => {
    if (!room) return

    // When the hook first mounts or the room reconnects, there may
    // already be remote participants with subscribed audio tracks.
    // Attach them now.
    const attachExisting = () => {
      room.remoteParticipants.forEach((participant) => {
        participant.audioTrackPublications.forEach((pub) => {
          if (
            pub.track &&
            pub.isSubscribed &&
            pub.kind === Track.Kind.Audio
          ) {
            attachTrack(pub.track, pub, participant)
          }
        })
      })
    }

    attachExisting()

    // Also handle room reconnection — re-attach everything
    room.on(RoomEvent.Reconnected, attachExisting)
    return () => room.off(RoomEvent.Reconnected, attachExisting)
  }, [room])

  // ── Subscribe / unsubscribe listeners ──
  useEffect(() => {
    if (!room) return

    const onSubscribed = (track, pub, participant) => {
      if (pub.kind !== Track.Kind.Audio) return
      if (participant.isLocal) return
      attachTrack(track, pub, participant)
    }

    const onUnsubscribed = (_track, pub, participant) => {
      if (pub.kind !== Track.Kind.Audio) return
      if (participant.isLocal) return
      detachTrack(pub)
    }

    room.on(RoomEvent.TrackSubscribed, onSubscribed)
    room.on(RoomEvent.TrackUnsubscribed, onUnsubscribed)

    return () => {
      room.off(RoomEvent.TrackSubscribed, onSubscribed)
      room.off(RoomEvent.TrackUnsubscribed, onUnsubscribed)
    }
  }, [room])

  // ── Core: create <audio> for a track ──
  function attachTrack(track, pub, participant) {
    const sid = pub.trackSid
    if (!sid || !containerRef.current) return

    // If we already have an element for this track, detach first
    if (audioElementsRef.current.has(sid)) {
      const old = audioElementsRef.current.get(sid)
      cleanupAudioElement(old, sid)
    }

    const el = document.createElement("audio")
    el.autoplay = true
    el.playsInline = true
    el.setAttribute("data-track-sid", sid)
    el.setAttribute(
      "data-participant",
      participant.identity || participant.sid,
    )

    // Attach the MediaStream from the LiveKit track
    track.attach(el)

    containerRef.current.appendChild(el)
    audioElementsRef.current.set(sid, el)

    console.log(
      `${P} ▶️ Attached audio for ${participant.identity} (${sid})`,
    )

    // Attempt to play with retries — WebViews can be slow
    playWithRetry(el, sid, participant.identity)
  }

  function detachTrack(pub) {
    const sid = pub.trackSid
    if (!sid) return

    const el = audioElementsRef.current.get(sid)
    if (el) {
      cleanupAudioElement(el, sid)
      audioElementsRef.current.delete(sid)
    }
  }
}

// ─── Helpers (module-level) ──────────────────────────────────────────────────

function cleanupAudioElement(el, sid) {
  try {
    el.pause()
    el.srcObject = null
    el.remove()
    console.log(`${P} 🔇 Removed audio element (${sid})`)
  } catch {}
}

/**
 * Attempt to play an <audio> element with retries.
 * WebViews often need multiple attempts with increasing delays.
 */
function playWithRetry(el, sid, identity, attempt = 0) {
  const delays = [0, 200, 600, 1500]
  if (attempt >= delays.length) return

  setTimeout(() => {
    // Bail if the element was already removed
    if (!el.parentNode) return

    el.play()
      .then(() => {
        console.log(
          `${P} ✅ Playing audio for ${identity} (${sid}) [attempt ${attempt + 1}]`,
        )
      })
      .catch((err) => {
        console.warn(
          `${P} ⚠️ play() failed for ${identity} (${sid}) [attempt ${attempt + 1}]:`,
          err.message,
        )
        // Retry with next delay
        playWithRetry(el, sid, identity, attempt + 1)
      })
  }, delays[attempt])
}
