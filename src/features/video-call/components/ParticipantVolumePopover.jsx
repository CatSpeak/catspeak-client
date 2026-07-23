import React, { useState, useEffect } from "react"
import { MoreVertical, Volume2, VolumeX, MicOff, VideoOff, UserX } from "lucide-react"
import { toast } from "react-hot-toast"
import Popover from "@/shared/components/ui/Popover"
import Slider from "@/shared/components/ui/Slider"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGlobalVideoCall as useVideoCallContext } from "@/features/video-call/context/GlobalVideoCallProvider"
import { isCustomRoom } from "@/features/video-call/utils/roomTypeHelpers"
import {
  useKickParticipantMutation,
  useMuteParticipantMutation,
} from "@/store/api/roomsApi"

export const ParticipantVolumeSlider = ({ participant, className = "", isInline = false }) => {
  const { t } = useLanguage()
  const pl = t.rooms.videoCall.participantList

  // Volume is 0 → 1
  const [volume, setVolume] = useState(1)
  const [prevVolume, setPrevVolume] = useState(1)

  // Initial load from participant
  useEffect(() => {
    if (!participant || participant.isLocal) return
    if (typeof participant.getVolume === "function") {
      let v = participant.getVolume()
      if (typeof v !== "number" || isNaN(v)) {
        v = 1
      }
      setVolume(v)
      if (v > 0) setPrevVolume(v)
    }
  }, [participant])

  // Keep prevVolume in sync even if volume changes externally
  useEffect(() => {
    if (volume > 0) {
      setPrevVolume(volume)
    }
  }, [volume])

  const applyVolume = (val) => {
    setVolume(val)

    if (participant && !participant.isLocal) {
      if (typeof participant.setVolume === "function") {
        participant.setVolume(val)
      } else {
        // Fallback for older livekit versions
        participant.audioTrackPublications.forEach((pub) => {
          if (pub.track && typeof pub.track.setVolume === "function") {
            pub.track.setVolume(val)
          }
        })
      }
    }
  }

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value)
    applyVolume(val)
  }

  const handleToggleMute = () => {
    if (volume <= 0.001) {
      // muted → restore previous
      applyVolume(prevVolume || 1)
    } else {
      // unmuted → mute
      applyVolume(0)
    }
  }

  const isMuted = volume <= 0.001

  return (
    <div className={`flex flex-col gap-2 relative ${isInline ? 'w-full' : 'bg-white rounded-lg shadow-lg border border-[#e5e5e5] p-3 w-48'} ${className}`}>
      <div className="flex items-center justify-between text-xs text-[#606060] mb-1">
        <span>{pl.volume}</span>
        <span>{Math.round(volume * 100)}%</span>
      </div>

      <div className="flex items-center gap-3">
        {/* Clickable mute toggle */}
        <button
          onClick={handleToggleMute}
          className="cursor-pointer"
          title={isMuted ? pl.unmute : pl.mute}
        >
          {isMuted ? (
            <VolumeX size={20} strokeWidth={1} />
          ) : (
            <Volume2 size={20} strokeWidth={1} />
          )}
        </button>

        <Slider
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={handleVolumeChange}
          title={pl.adjustVolume}
        />
      </div>
    </div>
  )
}

export const ParticipantVolumePopover = ({ participant, children }) => {
  const { t } = useLanguage()
  const { room, user, id: roomId, lkRoom } = useVideoCallContext()

  const [kickParticipant, { isLoading: isKicking }] = useKickParticipantMutation()
  const [muteParticipant, { isLoading: isMuting }] = useMuteParticipantMutation()

  if (participant.isLocal) return <>{children}</>

  const isCurrentHost =
    isCustomRoom(room?.roomType) &&
    room?.creatorId != null &&
    user?.accountId != null &&
    String(room.creatorId) === String(user.accountId)

  const parseMetadata = (metadata) => {
    if (!metadata) return {}
    try {
      return JSON.parse(metadata)
    } catch {
      return {}
    }
  }

  const meta = parseMetadata(participant.metadata)
  const targetAccountId = meta.accountId || participant.identity

  const handleMuteTrack = async (trackKind) => {
    if (!roomId) return
    try {
      await muteParticipant({
        id: roomId,
        participantId: targetAccountId,
        trackKind,
        muted: true,
      }).unwrap()
    } catch (err) {
      console.warn("Backend mute API response:", err)
    }

    if (lkRoom?.localParticipant) {
      try {
        const payload = new TextEncoder().encode(
          JSON.stringify({
            action: "MUTE_PARTICIPANT",
            targetId: String(targetAccountId),
            targetIdentity: String(participant.identity),
            trackKind,
          })
        )
        lkRoom.localParticipant.publishData(payload, {
          topic: "moderation",
          reliable: true,
        })
      } catch (e) {
        console.error("Failed to broadcast mute packet:", e)
      }
    }

    toast.success(
      trackKind === "audio"
        ? "Đã tắt mic người dùng"
        : "Đã tắt camera người dùng"
    )
  }

  const handleKick = async () => {
    if (!roomId) return
    if (!window.confirm(`Bạn có chắc chắn muốn mời ${participant.name || "người dùng"} ra khỏi phòng?`)) {
      return
    }
    try {
      await kickParticipant({
        id: roomId,
        participantId: targetAccountId,
      }).unwrap()
    } catch (err) {
      console.warn("Backend kick API response:", err)
    }

    if (lkRoom?.localParticipant) {
      try {
        const payload = new TextEncoder().encode(
          JSON.stringify({
            action: "KICK_PARTICIPANT",
            targetId: String(targetAccountId),
            targetIdentity: String(participant.identity),
          })
        )
        lkRoom.localParticipant.publishData(payload, {
          topic: "moderation",
          reliable: true,
        })
      } catch (e) {
        console.error("Failed to broadcast kick packet:", e)
      }
    }

    toast.success("Đã mời người dùng ra khỏi phòng")
  }


  const popoverContent = (
    <div className="bg-white rounded-lg shadow-lg border border-[#e5e5e5] p-3 w-56 flex flex-col gap-3">
      <ParticipantVolumeSlider participant={participant} isInline />

      {isCurrentHost && (
        <div className="border-t border-[#e5e5e5] pt-2 flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-[#8F8F8F] uppercase tracking-wider px-1 mb-0.5">
            Quản lý phòng (Host)
          </span>

          <button
            onClick={() => handleMuteTrack("audio")}
            disabled={isMuting}
            className="flex items-center gap-2 px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded transition-colors text-left w-full disabled:opacity-50"
          >
            <MicOff size={14} className="text-gray-500" />
            Tắt mic
          </button>

          <button
            onClick={() => handleMuteTrack("video")}
            disabled={isMuting}
            className="flex items-center gap-2 px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded transition-colors text-left w-full disabled:opacity-50"
          >
            <VideoOff size={14} className="text-gray-500" />
            Tắt camera
          </button>

          <button
            onClick={handleKick}
            disabled={isKicking}
            className="flex items-center gap-2 px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded transition-colors text-left w-full font-medium disabled:opacity-50"
          >
            <UserX size={14} className="text-red-500" />
            Mời ra khỏi phòng
          </button>
        </div>
      )}
    </div>
  )

  return (
    <Popover
      className="w-full"
      triggerClassName="w-full text-left"
      trigger={
        <button className="w-full text-left rounded hover:bg-[#F2F2F2] transition-colors focus:outline-none">
          {children}
        </button>
      }
      content={popoverContent}
      placement="bottom-right"
    />
  )
}

