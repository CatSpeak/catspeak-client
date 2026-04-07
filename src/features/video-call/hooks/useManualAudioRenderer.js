import { useEffect, useRef, useCallback } from "react"
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
 *  - On subscribe: creates OR REUSES a DOM `<audio>`, attaches the
 *    MediaStream, calls `.play()` with retry logic
 *  - On unsubscribe: detaches the track but KEEPS the `<audio>` element
 *    alive so it can be reused (preserves autoplay privilege in WebViews)
 *  - Keeps a Map<participantIdentity, { el, trackSid }> for reuse/cleanup
 *  - Elements are only fully removed when the participant disconnects
 *
 * Why reuse instead of recreate:
 *  WebView browsers (Zalo, Messenger, etc.) enforce strict autoplay
 *  policies. The initial `.play()` succeeds because the user tapped
 *  "Join" (a user gesture). If we destroy that `<audio>` and create a
 *  new one later (e.g. when a remote participant reconnects), the new
 *  `.play()` is blocked because there's no fresh user gesture. Reusing
 *  the same element preserves the autoplay privilege.
 *
 * Safe on all platforms — desktop browsers work identically.
 */
export const useManualAudioRenderer = () => {
  const room = useRoomContext()

  // Map of participantIdentity → { el: HTMLAudioElement, trackSid: string }
  const audioMapRef = useRef(new Map())
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
      audioMapRef.current.forEach((entry, identity) => {
        cleanupAudioElement(entry.el, identity)
      })
      audioMapRef.current.clear()
      container.remove()
      containerRef.current = null
    }
  }, [])

  // ── Core: attach an audio track to an <audio> element ──
  // Reuses existing element for the same participant to preserve
  // autoplay privilege in WebViews.
  const attachTrack = useCallback((track, pub, participant) => {
    const identity = participant.identity
    const sid = pub.trackSid
    if (!identity || !sid || !containerRef.current) return

    const existing = audioMapRef.current.get(identity)

    if (existing) {
      // Reuse the existing <audio> element — just swap the track.
      // This preserves the autoplay privilege from the original user gesture.
      if (existing.trackSid === sid) {
        // Same track re-subscribed (e.g. after network hiccup) — re-attach
        console.log(`${P} 🔄 Re-attaching same track for ${identity} (${sid})`)
      } else {
        // Different track (participant reconnected) — detach old, attach new
        console.log(
          `${P} 🔄 Swapping track for ${identity}: ${existing.trackSid} → ${sid}`,
        )
      }

      // Detach whatever was on the element before
      existing.el.srcObject = null

      // Attach the new track's MediaStream
      track.attach(existing.el)
      existing.trackSid = sid
      existing.el.setAttribute("data-track-sid", sid)

      // Play — should succeed since the element already has autoplay privilege
      playWithRetry(existing.el, sid, identity)
    } else {
      // First time seeing this participant — create a new <audio>
      const el = document.createElement("audio")
      el.autoplay = true
      el.playsInline = true
      el.setAttribute("data-participant", identity)
      el.setAttribute("data-track-sid", sid)

      track.attach(el)

      containerRef.current.appendChild(el)
      audioMapRef.current.set(identity, { el, trackSid: sid })

      console.log(`${P} ▶️ Created audio element for ${identity} (${sid})`)

      playWithRetry(el, sid, identity)
    }
  }, [])

  // ── Detach track but keep the <audio> element alive ──
  const detachTrack = useCallback((pub, participant) => {
    const identity = participant.identity
    const sid = pub.trackSid
    if (!identity) return

    const entry = audioMapRef.current.get(identity)
    if (entry && entry.trackSid === sid) {
      // Don't remove the element — just clear the srcObject.
      // The element stays in the DOM so it retains autoplay privilege.
      entry.el.srcObject = null
      entry.trackSid = null
      console.log(
        `${P} 🔇 Detached track for ${identity} (${sid}) — element kept`,
      )
    }
  }, [])

  // ── Remove element entirely when participant leaves the room ──
  const removeParticipant = useCallback((participant) => {
    const identity = participant.identity
    if (!identity) return

    const entry = audioMapRef.current.get(identity)
    if (entry) {
      cleanupAudioElement(entry.el, identity)
      audioMapRef.current.delete(identity)
    }
  }, [])

  // ── Attach existing remote audio tracks on mount / reconnect ──
  useEffect(() => {
    if (!room) return

    const attachExisting = () => {
      room.remoteParticipants.forEach((participant) => {
        participant.audioTrackPublications.forEach((pub) => {
          if (pub.track && pub.isSubscribed && pub.kind === Track.Kind.Audio) {
            attachTrack(pub.track, pub, participant)
          }
        })
      })
    }

    attachExisting()

    room.on(RoomEvent.Reconnected, attachExisting)
    return () => room.off(RoomEvent.Reconnected, attachExisting)
  }, [room, attachTrack])

  // ── Subscribe / unsubscribe / disconnect listeners ──
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
      detachTrack(pub, participant)
    }

    const onParticipantDisconnected = (participant) => {
      removeParticipant(participant)
    }

    room.on(RoomEvent.TrackSubscribed, onSubscribed)
    room.on(RoomEvent.TrackUnsubscribed, onUnsubscribed)
    room.on(RoomEvent.ParticipantDisconnected, onParticipantDisconnected)

    return () => {
      room.off(RoomEvent.TrackSubscribed, onSubscribed)
      room.off(RoomEvent.TrackUnsubscribed, onUnsubscribed)
      room.off(RoomEvent.ParticipantDisconnected, onParticipantDisconnected)
    }
  }, [room, attachTrack, detachTrack, removeParticipant])
}

// ─── Helpers (module-level) ──────────────────────────────────────────────────

function cleanupAudioElement(el, identity) {
  try {
    el.pause()
    el.srcObject = null
    el.remove()
    console.log(`${P} 🗑️ Removed audio element for ${identity}`)
  } catch {}
}

/**
 * Attempt to play an <audio> element with retries.
 * WebViews often need multiple attempts with increasing delays.
 */
function playWithRetry(el, sid, identity, attempt = 0) {
  const delays = [0, 200, 600, 1500, 3000]
  if (attempt >= delays.length) {
    console.warn(
      `${P} ❌ All play attempts exhausted for ${identity} (${sid})`,
    )
    return
  }

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
