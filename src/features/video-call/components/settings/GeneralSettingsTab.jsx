import React from "react"
import Switch from "@/shared/components/ui/inputs/Switch"
import ListItem from "@/shared/components/ui/ListItem"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGlobalVideoCall as useVideoCallContext } from "@/features/video-call/context/GlobalVideoCallProvider"
import { isRoomHost } from "@/features/video-call/utils/roomTypeHelpers"
import {
  getRoomSetting,
  setRoomSetting,
  ROOM_SETTING_KEYS,
} from "@/features/video-call/utils/roomSettingHelpers"

const GeneralSettingsTab = ({
  receiveSystemMsgs = true,
  setReceiveSystemMsgs,
}) => {
  const { t } = useLanguage()
  const gt = t?.rooms?.videoCall?.general || {}
  const { room, user, id: roomIdFromContext, isHost: isHostFromContext, lkRoom } = useVideoCallContext()
  const currentRoomId = room?.id || roomIdFromContext
  const isHost = isHostFromContext || isRoomHost(room, user?.accountId)

  const [joinLeaveSound, setJoinLeaveSound] = React.useState(() => {
    return getRoomSetting(currentRoomId, ROOM_SETTING_KEYS.JOIN_LEAVE_SOUND)
  })

  const [memberRecordingAllowed, setMemberRecordingAllowed] = React.useState(() => {
    return getRoomSetting(currentRoomId, ROOM_SETTING_KEYS.MEMBER_RECORDING)
  })

  const [memberPrivateAiAllowed, setMemberPrivateAiAllowed] = React.useState(() => {
    return getRoomSetting(currentRoomId, ROOM_SETTING_KEYS.MEMBER_PRIVATE_AI)
  })

  React.useEffect(() => {
    const handleSoundChange = () => {
      setJoinLeaveSound(getRoomSetting(currentRoomId, ROOM_SETTING_KEYS.JOIN_LEAVE_SOUND))
    }
    const handleRecordingChange = () => {
      setMemberRecordingAllowed(getRoomSetting(currentRoomId, ROOM_SETTING_KEYS.MEMBER_RECORDING))
    }
    const handlePrivateAiChange = () => {
      setMemberPrivateAiAllowed(getRoomSetting(currentRoomId, ROOM_SETTING_KEYS.MEMBER_PRIVATE_AI))
    }
    window.addEventListener("catspeak_join_leave_sound_changed", handleSoundChange)
    window.addEventListener("catspeak_member_recording_allowed_changed", handleRecordingChange)
    window.addEventListener("catspeak_member_private_ai_allowed_changed", handlePrivateAiChange)
    return () => {
      window.removeEventListener("catspeak_join_leave_sound_changed", handleSoundChange)
      window.removeEventListener("catspeak_member_recording_allowed_changed", handleRecordingChange)
      window.removeEventListener("catspeak_member_private_ai_allowed_changed", handlePrivateAiChange)
    }
  }, [currentRoomId])

  const handleToggleSound = (e) => {
    const val = e.target.checked
    setJoinLeaveSound(val)
    setRoomSetting(currentRoomId, ROOM_SETTING_KEYS.JOIN_LEAVE_SOUND, val)
    window.dispatchEvent(new Event("catspeak_join_leave_sound_changed"))

    if (lkRoom?.localParticipant) {
      try {
        const payload = new TextEncoder().encode(
          JSON.stringify({ action: "TOGGLE_JOIN_SOUND", enabled: val, roomId: currentRoomId })
        )
        lkRoom.localParticipant.publishData(payload, {
          topic: "moderation",
          reliable: true,
        })
      } catch (err) {
        console.error("Failed to broadcast TOGGLE_JOIN_SOUND:", err)
      }
    }
  }

  const handleToggleMemberRecording = (e) => {
    const val = e.target.checked
    setMemberRecordingAllowed(val)
    setRoomSetting(currentRoomId, ROOM_SETTING_KEYS.MEMBER_RECORDING, val)
    window.dispatchEvent(new Event("catspeak_member_recording_allowed_changed"))

    if (lkRoom?.localParticipant) {
      try {
        const payload = new TextEncoder().encode(
          JSON.stringify({ action: "TOGGLE_MEMBER_RECORDING", allowed: val, roomId: currentRoomId })
        )
        lkRoom.localParticipant.publishData(payload, {
          topic: "moderation",
          reliable: true,
        })
      } catch (err) {
        console.error("Failed to broadcast TOGGLE_MEMBER_RECORDING:", err)
      }
    }
  }

  const handleToggleMemberPrivateAi = (e) => {
    const val = e.target.checked
    setMemberPrivateAiAllowed(val)
    setRoomSetting(currentRoomId, ROOM_SETTING_KEYS.MEMBER_PRIVATE_AI, val)
    window.dispatchEvent(new Event("catspeak_member_private_ai_allowed_changed"))

    if (lkRoom?.localParticipant) {
      try {
        const payload = new TextEncoder().encode(
          JSON.stringify({ action: "TOGGLE_MEMBER_PRIVATE_AI", allowed: val, roomId: currentRoomId })
        )
        lkRoom.localParticipant.publishData(payload, {
          topic: "moderation",
          reliable: true,
        })
      } catch (err) {
        console.error("Failed to broadcast TOGGLE_MEMBER_PRIVATE_AI:", err)
      }
    }
  }

  return (
    <div className="bg-white rounded-xl border border-border flex flex-col divide-y divide-border">
      <ListItem
        lines="auto"
        rightContent={
          <Switch
            checked={receiveSystemMsgs}
            onChange={(e) => setReceiveSystemMsgs?.(e.target.checked)}
            colorClass="peer-checked:bg-green-500"
          />
        }
      >
        <span>
          {gt.receiveSystemMsgs || "Nhận thông báo tin nhắn hệ thống"}
        </span>
        <span className="text-sm text-[#606060]">
          {gt.receiveSystemMsgsDesc ||
            "Hiển thị các thông báo tự động từ hệ thống trong khi cuộc họp đang diễn ra."}
        </span>
      </ListItem>

      {isHost && (
        <>
          <ListItem
            lines="auto"
            rightContent={
              <Switch
                checked={joinLeaveSound}
                onChange={handleToggleSound}
                colorClass="peer-checked:bg-green-500"
              />
            }
          >
            <span>
              {gt.joinLeaveSound || "Âm thanh khi người dùng vào / ra phòng"}
            </span>
            <span className="text-sm text-[#606060]">
              {gt.joinLeaveSoundDesc ||
                "Phát chuông thông báo âm thanh khi có thành viên mới vào hoặc rời khỏi cuộc họp."}
            </span>
          </ListItem>

          <ListItem
            lines="auto"
            rightContent={
              <Switch
                checked={memberRecordingAllowed}
                onChange={handleToggleMemberRecording}
                colorClass="peer-checked:bg-green-500"
              />
            }
          >
            <span>
              {gt.allowMemberRecording || "Cho phép thành viên Ghi hình (Record) cuộc họp"}
            </span>
            <span className="text-sm text-[#606060]">
              {gt.allowMemberRecordingDesc ||
                "Khi tắt, thành viên không thể dùng tính năng record nền tảng và video sẽ bị che đen nếu quay bằng ứng dụng bên ngoài (âm thanh vẫn giữ nguyên)."}
            </span>
          </ListItem>

          <ListItem
            lines="auto"
            rightContent={
              <Switch
                checked={memberPrivateAiAllowed}
                onChange={handleToggleMemberPrivateAi}
                colorClass="peer-checked:bg-green-500"
              />
            }
          >
            <span>
              {gt.allowMemberPrivateAi || "Cho phép thành viên sử dụng AI Chat riêng tư"}
            </span>
            <span className="text-sm text-[#606060]">
              {gt.allowMemberPrivateAiDesc ||
                "Khi tắt, thành viên chỉ có thể sử dụng AI Chat công khai trong phòng họp, không thể trò chuyện riêng với AI."}
            </span>
          </ListItem>
        </>
      )}
    </div>
  )
}

export default GeneralSettingsTab
