import { useEffect, useState } from "react"
import { RoomEvent, Track, TrackPublication, VideoQuality } from "livekit-client"

import {
  EGRESS_PROFILE_STANDARD,
  VIDEO_QUALITY_LOW,
  resolveCallPolicy,
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
 */
export const useSubscriptionPolicy = ({
  room,
  country,
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
    ]

    events.forEach((event) => room.on(event, handleChange))

    return () => {
      events.forEach((event) => room.off(event, handleChange))
    }
  }, [room])

  useEffect(() => {
    if (!room) return

    const policy = resolveCallPolicy(country, egressProfile, highQuality)
    if (policy.egressProfile !== EGRESS_PROFILE_STANDARD) return

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

    const plan = resolveSubscriptionPlan(
      publications,
      activeSpeaker?.identity ?? null,
      pinnedParticipantId,
      policy.subscribe.maxVideoTiles,
      policy.egressProfile,
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

      const quality = VIDEO_QUALITY_VALUES[decision.quality]
      if (
        decision.subscribed &&
        quality !== undefined &&
        publication.videoQuality !== quality
      ) {
        publication.setVideoQuality(quality)
      }
    })
  }, [
    room,
    country,
    egressProfile,
    highQuality,
    pinnedParticipantId,
    revision,
  ])
}
