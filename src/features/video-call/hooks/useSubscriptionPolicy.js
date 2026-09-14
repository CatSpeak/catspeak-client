import { useEffect, useState } from "react"
import { RoomEvent, Track, TrackPublication, VideoQuality } from "livekit-client"

import {
  VIDEO_QUALITY_LOW,
  resolveCallPolicy,
  resolveEffectiveSubscriptionPlan,
  resolveSubscriptionPlan,
} from "@/features/video-call/utils/callPolicy"

const VIDEO_QUALITY_VALUES = {
  [VIDEO_QUALITY_LOW]: VideoQuality.LOW,
}

/**
 * Applies the egress subscription policy to remote video publications.
 *
 * Only participants whose resolved egress profile is "standard" are capped
 * (active speaker + pinned camera tiles at LOW, screen share at LOW). Audio
 * publications and the local self-view are never touched; "full" participants
 * keep LiveKit's default full-grid behavior.
 *
 * Independently of the egress profile, the local participant's connection
 * quality degrades every remote video subscription: POOR drops non-essential
 * tiles and lowers the rest to LOW, LOST switches to audio-only, and both
 * recover automatically once quality improves. This applies to every
 * participant regardless of country.
 */
export const useSubscriptionPolicy = ({
  room,
  egressProfile,
  highQuality,
  pinnedParticipantId,
}) => {
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    if (!room) return undefined

    const handleChange = () => setRevision((value) => value + 1)
    const events = [
      RoomEvent.ParticipantConnected,
      RoomEvent.ParticipantDisconnected,
      RoomEvent.TrackPublished,
      RoomEvent.TrackUnpublished,
      RoomEvent.TrackSubscribed,
      RoomEvent.TrackUnsubscribed,
      RoomEvent.ActiveSpeakersChanged,
      RoomEvent.ConnectionQualityChanged,
    ]

    events.forEach((event) => room.on(event, handleChange))

    return () => {
      events.forEach((event) => room.off(event, handleChange))
    }
  }, [room])

  // Dev-only QA handle: __catspeakSimulateScenario("subscriber-bandwidth", bps)
  useEffect(() => {
    if (!import.meta.env.DEV || typeof room?.simulateScenario !== "function") {
      return undefined
    }

    window.__catspeakSimulateScenario = (scenario, arg) =>
      room.simulateScenario(scenario, arg)

    return () => {
      delete window.__catspeakSimulateScenario
    }
  }, [room])

  useEffect(() => {
    if (!room) return

    const policy = resolveCallPolicy(egressProfile, highQuality)

    const publications = []
    const publicationBySid = new Map()

    room.remoteParticipants.forEach((participant) => {
      participant.trackPublications.forEach((publication) => {
        if (publication.kind !== Track.Kind.Video) return

        publications.push({
          trackSid: publication.trackSid,
          participantId: participant.identity,
          source: publication.source,
          isLocal: false,
        })
        publicationBySid.set(publication.trackSid, publication)
      })
    })

    const activeSpeaker = room.activeSpeakers.find(
      (participant) => !participant.isLocal,
    )

    const basePlan = resolveSubscriptionPlan(
      publications,
      activeSpeaker?.identity ?? null,
      pinnedParticipantId,
      policy.subscribe.maxVideoTiles,
      policy.egressProfile,
    )

    const plan = resolveEffectiveSubscriptionPlan(
      room.localParticipant?.connectionQuality,
      basePlan,
    )

    plan.forEach((decision) => {
      const publication = publicationBySid.get(decision.trackSid)
      if (!publication?.setSubscribed) return

      const isUnsubscribed =
        publication.subscriptionStatus ===
        TrackPublication.SubscriptionStatus.Unsubscribed

      if (decision.subscribed === isUnsubscribed) {
        publication.setSubscribed(decision.subscribed)
      }

      if (!decision.subscribed) return

      const quality = VIDEO_QUALITY_VALUES[decision.quality]
      if (quality !== undefined) {
        if (publication.videoQuality !== quality) {
          publication.setVideoQuality(quality)
        }
      } else if (publication.videoQuality !== VideoQuality.HIGH) {
        publication.setVideoQuality(undefined)
      }
    })
  }, [
    room,
    egressProfile,
    highQuality,
    pinnedParticipantId,
    revision,
  ])
}
