import React, { useState, useEffect } from "react"
import { MoreVertical, Volume2, VolumeX, MicOff, VideoOff, UserX, MonitorUp, Shield } from "lucide-react"
import { toast } from "react-hot-toast"
import Popover from "@/shared/components/ui/Popover"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import Slider from "@/shared/components/ui/Slider"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGlobalVideoCall as useVideoCallContext } from "@/features/video-call/context/GlobalVideoCallProvider"
import { isRoomHost } from "@/features/video-call/utils/roomTypeHelpers"
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

  const handleVolumeChange = (eOrVal) => {
    const val =
      typeof eOrVal === "object" && eOrVal !== null && "target" in eOrVal
        ? parseFloat(eOrVal.target.value)
        : Array.isArray(eOrVal)
        ? eOrVal[0]
        : Number(eOrVal)

    if (isNaN(val)) return
    setVolume(val)
    if (val > 0) setPrevVolume(val)

    if (participant && typeof participant.setVolume === "function") {
      participant.setVolume(val)
    }
  }

  const toggleMute = () => {
    if (volume > 0) {
      setPrevVolume(volume)
      handleVolumeChange(0)
    } else {
      handleVolumeChange(prevVolume || 1)
    }
  }

  const formatPercent = (val) => Math.round(val * 100)

  if (isInline) {
    return (
      <div className={`flex items-center gap-3 py-2 px-2 ${className}`}>
        <button
          type="button"
          onClick={toggleMute}
          className="text-gray-500 hover:text-gray-900 transition-colors shrink-0"
          title={volume === 0 ? pl.unmute : pl.mute}
        >
          {volume === 0 ? (
            <VolumeX size={20} className="text-red-500" />
          ) : (
            <Volume2 size={20} />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <Slider
            value={volume}
            min={0}
            max={1}
            step={0.01}
            onChange={handleVolumeChange}
            onValueChange={handleVolumeChange}
            aria-label={pl.adjustVolume}
          />
        </div>
        <span className="text-sm font-semibold text-gray-700 w-11 text-right tabular-nums shrink-0">
          {formatPercent(volume)}%
        </span>
      </div>
    )
  }

  return (
    <div className={`p-3 w-60 flex flex-col gap-2 bg-white rounded-xl ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {pl.volume}
        </span>
        <span className="text-sm font-bold text-gray-900">
          {formatPercent(volume)}%
        </span>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleMute}
          className="text-gray-500 hover:text-gray-900 transition-colors"
          title={volume === 0 ? pl.unmute : pl.mute}
        >
          {volume === 0 ? (
            <VolumeX size={20} className="text-red-500" />
          ) : (
            <Volume2 size={20} />
          )}
        </button>
        <div className="flex-1">
          <Slider
            value={volume}
            min={0}
            max={1}
            step={0.01}
            onChange={handleVolumeChange}
            onValueChange={handleVolumeChange}
            aria-label={pl.adjustVolume}
          />
        </div>
      </div>
    </div>
  )
}

export const ParticipantActionPopover = ({ participant, children }) => {
  const { t } = useLanguage()
  const pl = t.rooms?.videoCall?.participantList || {}
  const { room, user, id: roomId, lkRoom, isHost: isCurrentHostFromContext } = useVideoCallContext()
  const isCurrentHost = isCurrentHostFromContext || isRoomHost(room, user?.accountId)

  const [kickParticipant, { isLoading: isKicking }] = useKickParticipantMutation()
  const [muteParticipant, { isLoading: isMuting }] = useMuteParticipantMutation()

  if (participant.isLocal) return <>{children}</>

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
        targetAccountId,
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
        ? (pl.successMuteMic || "Đã tắt mic người dùng")
        : trackKind === "screen"
        ? (pl.successStopScreen || "Đã dừng chia sẻ màn hình người dùng")
        : (pl.successMuteCam || "Đã tắt camera người dùng")
    )
  }

  const [kickConfirm, setKickConfirm] = React.useState({ open: false, banRejoin: false })

  const handleKick = (banRejoin = false) => {
    setKickConfirm({ open: true, banRejoin })
  }

  const confirmKick = async () => {
    const banRejoin = kickConfirm.banRejoin
    setKickConfirm({ open: false, banRejoin: false })
    if (!roomId) return
    try {
      await kickParticipant({
        id: roomId,
        targetAccountId: Number(targetAccountId),
        participantId: Number(targetAccountId),
        banRejoin,
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
            banRejoin,
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

    toast.success(banRejoin ? (pl.successBan || "Đã mời người dùng ra khỏi phòng và cấm vào lại") : (pl.successKick || "Đã mời người dùng ra khỏi phòng"))
  }


  const popoverContent = (
    <div className="bg-white rounded-xl shadow-lg border border-neutral-200/80 p-3 w-72 flex flex-col gap-2">
      <ParticipantVolumeSlider participant={participant} isInline />

      {isCurrentHost && (
        <div className="border-t border-neutral-100 pt-2 flex flex-col gap-1">
          <button
            onClick={() => handleMuteTrack("audio")}
            disabled={isMuting}
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors text-left w-full disabled:opacity-50"
          >
            <MicOff size={18} className="text-neutral-500 shrink-0" />
            <span>{pl.mute || "Tắt tiếng"}</span>
          </button>

          <button
            onClick={() => handleMuteTrack("video")}
            disabled={isMuting}
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors text-left w-full disabled:opacity-50"
          >
            <VideoOff size={18} className="text-neutral-500 shrink-0" />
            <span>{pl.muteCam || "Tắt camera"}</span>
          </button>

          <button
            onClick={() => handleMuteTrack("screen")}
            disabled={isMuting}
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors text-left w-full disabled:opacity-50"
          >
            <MonitorUp size={18} className="text-neutral-500 shrink-0" />
            <span>{pl.stopScreenShare || "Dừng chia sẻ màn hình"}</span>
          </button>

          <button
            onClick={() => handleKick(false)}
            disabled={isKicking}
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left w-full disabled:opacity-50"
          >
            <UserX size={18} className="text-red-500 shrink-0" />
            <span>{pl.kick || "Mời ra khỏi phòng"}</span>
          </button>

          <button
            onClick={() => handleKick(true)}
            disabled={isKicking}
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left w-full disabled:opacity-50"
          >
            <UserX size={18} className="text-red-600 shrink-0" />
            <span>{pl.ban || "Xóa & Cấm vào lại"}</span>
          </button>
        </div>
      )}
    </div>
  )

  return (<>
    <Popover
      className="w-full"
      triggerClassName="w-full text-left"
      trigger={
        <div className="w-full text-left cursor-pointer focus:outline-none">
          {children}
        </div>
      }
      content={popoverContent}
      placement="bottom-right"
    />

    <ConfirmationModal
      open={kickConfirm.open}
      onClose={() => setKickConfirm({ open: false, banRejoin: false })}
      onConfirm={confirmKick}
      title={kickConfirm.banRejoin ? (pl.confirmBanTitle || "Xóa & Cấm vào lại") : (pl.confirmKickTitle || "Mời ra khỏi phòng")}
      message={kickConfirm.banRejoin ? (pl.confirmBan || "Bạn có chắc chắn muốn mời người dùng ra khỏi phòng và CẤM VÀO LẠI?") : (pl.confirmKick || "Bạn có chắc chắn muốn mời người dùng ra khỏi phòng?")}
      confirmText={kickConfirm.banRejoin ? (pl.ban || "Xóa & Cấm vào lại") : (pl.kick || "Mời ra khỏi phòng")}
      confirmVariant="destructive"
      isPending={isKicking}
    />
  </>)
}

