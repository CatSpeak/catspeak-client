import React from "react"
import Switch from "@/shared/components/ui/inputs/Switch"
import ListItem from "@/shared/components/ui/ListItem"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGlobalVideoCall as useVideoCallContext } from "@/features/video-call/context/GlobalVideoCallProvider"

/**
 * Personal ("Tùy chọn của tôi") settings tab.
 *
 * Only preferences that apply to the current user and are reused across rooms.
 * Account-scoped persistence lives in GlobalVideoCallProvider. Room-wide
 * policies (recording, private AI, games, high quality, lock...) belong to the
 * participant panel's room management section instead.
 */
const PersonalSettingsTab = ({
  receiveSystemMsgs = true,
  setReceiveSystemMsgs,
}) => {
  const { t } = useLanguage()
  const gt = t?.rooms?.videoCall?.general || {}
  const {
    joinLeaveSound,
    setJoinLeaveSound,
  } = useVideoCallContext()

  return (
    <div className="flex flex-col divide-y divide-[#e5e5e5] rounded-xl border border-[#e5e5e5] bg-white">
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
        <span>{gt.receiveSystemMsgs || "Nhận thông báo tin nhắn hệ thống"}</span>
        <span className="text-sm text-[#606060]">
          {gt.receiveSystemMsgsDesc ||
            "Hiển thị các thông báo tự động từ hệ thống trong khi cuộc họp đang diễn ra."}
        </span>
      </ListItem>

      <ListItem
        lines="auto"
        rightContent={
          <Switch
            checked={joinLeaveSound === true}
            onChange={(e) => setJoinLeaveSound?.(e.target.checked)}
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
    </div>
  )
}

export default PersonalSettingsTab
