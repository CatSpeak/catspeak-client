import { Mic, MicOff, Video, VideoOff } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import Avatar from "@/shared/components/ui/Avatar"
import { useVideoCallContext } from "@/features/video-call/context/VideoCallContext"

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
    <div className="flex items-center justify-between gap-3 pl-1.5 pr-2 py-1 rounded w-full">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar size={40} name={name} />
        <div className="flex-1 min-w-0">
          <p className="text-black text-sm font-medium truncate m-0">
            {name} {isLocal && pl.youSuffix}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        {isCameraOn ? (
          <Video size={20} className="text-[#990011]" />
        ) : (
          <VideoOff size={20} />
        )}
        {isMicOn ? (
          <Mic size={20} className="text-[#990011]" />
        ) : (
          <MicOff size={20} />
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
        <div className="px-4 py-3 border-b border-[#C6C6C6]">
          <h3 className="text-black text-sm font-semibold m-0">
            {pl.title} ({participants.length})
          </h3>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-2">
        <ul className="flex flex-col">
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
