import React from "react"
import Switch from "@/shared/components/ui/inputs/Switch"
import ListItem from "@/shared/components/ui/ListItem"
import { useLanguage } from "@/shared/context/LanguageContext"

const GeneralSettingsTab = ({
  receiveSystemMsgs = true,
  setReceiveSystemMsgs,
}) => {
  const { t } = useLanguage()
  const gt = t?.rooms?.videoCall?.general || {}

  return (
    <div className="bg-white rounded-xl border border-[#e5e5e5]">
      <ListItem
        lines={2}
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
    </div>
  )
}

export default GeneralSettingsTab
