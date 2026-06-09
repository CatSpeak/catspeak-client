import React from "react"
import { Mic, MicOff, Video, VideoOff, Hand } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import Avatar from "@/shared/components/ui/Avatar"
import { useGlobalVideoCall as useVideoCallContext } from "@/features/video-call/context/GlobalVideoCallProvider"
import { ParticipantVolumePopover } from "./ParticipantVolumePopover"

/**
 * A single row in the participant list.
 * Uses LiveKit Participant object properties directly.
 */
const ParticipantItem = ({ participant }) => {
  const { t } = useLanguage()
  const { micOn: localMicOn, cameraOn: localCameraOn } = useVideoCallContext()
  const pl = t.rooms.videoCall.participantList

  const isLocal = participant.isLocal
  const isMicOn = isLocal
    ? localMicOn
    : (participant.isMicrophoneEnabled ?? false)
  const isCameraOn = isLocal
    ? localCameraOn
    : (participant.isCameraEnabled ?? false)

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

  const name =
    participant.name || participant.identity || (isLocal ? pl.you : pl.guest)

  return (
    <div className="flex items-center justify-between gap-3 pl-1.5 pr-2 py-2 rounded w-full">
      {/* LEFT */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar size={36} name={name} />

        <div className="flex flex-col min-w-0 flex-1">
          {/* Name */}
          <div className="flex items-center gap-2 m-0">
            <p className="text-sm leading-5 truncate m-0">
              {name} {isLocal && pl.youSuffix}
            </p>
          </div>

          {/* Mic + Camera UNDER name */}
          <div className="flex items-center gap-1 mt-1">
            {/* Camera (indicator only) */}
            <div className="flex items-center justify-center">
              {isCameraOn ? (
                <Video size={16} className="text-[#990011]" />
              ) : (
                <VideoOff size={16} className="text-[#606060]" />
              )}
            </div>

            {/* Mic (indicator only) */}
            <div className="flex items-center justify-center">
              {isMicOn ? (
                <Mic size={16} className="text-[#990011]" />
              ) : (
                <MicOff size={16} className="text-[#606060]" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: indicators (Hand icon to replace old popover trigger) */}
      <div className="flex items-center gap-1">
        {isHandRaised && (
          <div className="h-9 w-9 flex items-center justify-center">
            <Hand size={20} className="text-yellow-500 shrink-0" />
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Participant list panel.
 * Reads participants and local media state from VideoCallContext.
 */
const ParticipantList = ({ hideTitle }) => {
  const { t } = useLanguage()
  const { participants } = useVideoCallContext()
  const pl = t.rooms.videoCall.participantList

  const parseMetadata = (metadata) => {
    if (!metadata) return {}
    try {
      return JSON.parse(metadata)
    } catch {
      return {}
    }
  }

  const raisedHandParticipants = participants.filter((p) => {
    const meta = parseMetadata(p.metadata)
    return meta.handRaised === true
  })

  const otherParticipants = participants.filter((p) => {
    const meta = parseMetadata(p.metadata)
    return meta.handRaised !== true
  })

  return (
    <div className="flex flex-col h-full w-full bg-white">
      {!hideTitle && (
        <div className="px-4 py-3 border-b border-[#E5E5E5]">
          <h3 className="text-black text-sm font-semibold m-0">
            {pl.title} ({participants.length})
          </h3>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-1">
        {raisedHandParticipants.length > 0 && (
          <ul className="flex flex-col gap-1">
            {raisedHandParticipants.map((participant) => (
              <li key={participant.identity} className="w-full">
                <ParticipantVolumePopover participant={participant}>
                  <ParticipantItem participant={participant} />
                </ParticipantVolumePopover>
              </li>
            ))}
          </ul>
        )}

        {raisedHandParticipants.length > 0 && otherParticipants.length > 0 && (
          <div className="my-2 mx-1 border-t border-[#E5E5E5]" />
        )}

        {otherParticipants.length > 0 && (
          <ul className="flex flex-col gap-1">
            {otherParticipants.map((participant) => (
              <li key={participant.identity} className="w-full">
                <ParticipantVolumePopover participant={participant}>
                  <ParticipantItem participant={participant} />
                </ParticipantVolumePopover>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default ParticipantList
