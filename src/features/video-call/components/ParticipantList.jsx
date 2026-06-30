import React from "react"
import { Mic, MicOff, Video, VideoOff, Hand, UserPlus, MoreHorizontal } from "lucide-react"
import { useIsSpeaking } from "@livekit/components-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import Avatar from "@/shared/components/ui/Avatar"
import { useGlobalVideoCall as useVideoCallContext } from "@/features/video-call/context/GlobalVideoCallProvider"
import { ParticipantVolumePopover } from "./ParticipantVolumePopover"
import { getParticipantTheme } from "@/features/video-call/utils/participantTheme"

/**
 * A single row in the participant list.
 * Uses LiveKit Participant object properties directly.
 */
const ParticipantItem = ({ participant }) => {
  const { t } = useLanguage()
  const { micOn: localMicOn, cameraOn: localCameraOn } = useVideoCallContext()
  const isSpeaking = useIsSpeaking(participant)
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
  const avatarUrl = meta.avatarUrl

  const name =
    participant.name || participant.identity || (isLocal ? pl.you : pl.guest)

  // Get theme color for avatar background
  const theme = getParticipantTheme(participant.identity, name)
  const gradientColor = theme.bg.match(/#[0-9A-Fa-f]{6}/)?.[0] || "#7b7979"

  return (
    <div className="flex items-center justify-between gap-2 px-3 py-2 rounded w-full">
      {/* LEFT */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {/* Colored avatar circle with initial */}
        <div
          className="flex items-center justify-center rounded-full shrink-0"
          style={{
            width: 24,
            height: 24,
            background: gradientColor,
          }}
        >
          <span
            className="font-bold text-white text-center"
            style={{ fontSize: 12, lineHeight: 1.4, width: name.length > 1 ? 18 : 8 }}
          >
            {name.charAt(0).toUpperCase()}
          </span>
        </div>

        <div className="flex flex-col min-w-0 flex-1">
          {/* Name */}
          <p className="text-sm font-medium text-[#1a1a1a] truncate m-0 leading-[1.4]">
            {name} {isLocal && pl.youSuffix}
          </p>

          {/* Mic + Camera UNDER name */}
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex items-center justify-center">
              {isMicOn ? (
                <Mic size={16} className="text-[#1a1a1a]" />
              ) : (
                <MicOff size={16} className="text-[#1a1a1a]" />
              )}
            </div>
            <div className="flex items-center justify-center">
              {isCameraOn ? (
                <Video size={16} className="text-[#1a1a1a]" />
              ) : (
                <VideoOff size={16} className="text-[#1a1a1a]" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: indicators */}
      <div className="flex items-center gap-1">
        {isHandRaised && (
          <div className="h-6 w-6 flex items-center justify-center">
            <Hand size={16} className="text-yellow-500 shrink-0" />
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
    <div className="flex flex-col h-full w-full bg-[#FCFCFC]">
      {!hideTitle && (
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#FFDADE]">
          <h3 className="text-black text-sm font-medium m-0 leading-[1.4]">
            {pl.title} ({participants.length})
          </h3>
          <div className="flex items-center gap-1.5">
            <button
              className="flex items-center justify-center p-1 rounded hover:bg-gray-100 transition-colors"
              title="Invite participants"
            >
              <UserPlus size={20} className="text-[#1a1a1a]" />
            </button>
            <button
              className="flex items-center justify-center p-1 rounded hover:bg-gray-100 transition-colors"
              title="More options"
            >
              <MoreHorizontal size={20} className="text-[#1a1a1a]" />
            </button>
          </div>
        </div>
      )}
      <div className="flex-1 overflow-y-auto py-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#990011] [&::-webkit-scrollbar-thumb]:bg-clip-padding [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb:hover]:border-0 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar]:h-[6px]">
        {raisedHandParticipants.length > 0 && (
          <ul className="flex flex-col">
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
          <div className="my-1 mx-3 border-t border-[#E5E5E5]" />
        )}

        {otherParticipants.length > 0 && (
          <ul className="flex flex-col">
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
