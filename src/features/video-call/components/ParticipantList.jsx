import React from "react"
import { Mic, MicOff, Video, VideoOff } from "lucide-react"
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

  const name =
    participant.name || participant.identity || (isLocal ? pl.you : pl.guest)

  return (
    <div className="flex items-center justify-between gap-3 pl-1.5 pr-2 py-2 rounded w-full">
      {/* LEFT */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar size={36} name={name} />

        <div className="flex flex-col min-w-0 flex-1">
          {/* Name */}
          <p className="text-sm leading-5 truncate m-0">
            {name} {isLocal && pl.youSuffix}
          </p>

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

      {/* RIGHT: indicators + popover */}
      <div className="flex items-center gap-1">
        {/* Volume (ONLY interactive element) */}
        {!isLocal && (
          <div className="flex items-center justify-center">
            <ParticipantVolumePopover participant={participant} />
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

  return (
    <div className="flex flex-col h-full w-full bg-white">
      {!hideTitle && (
        <div className="px-4 py-3 border-b border-[#E5E5E5]">
          <h3 className="text-black text-sm font-semibold m-0">
            {pl.title} ({participants.length})
          </h3>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-2">
        <ul className="flex flex-col gap-1">
          {participants.map((participant) => (
            <li key={participant.identity}>
              <ParticipantItem participant={participant} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default ParticipantList
