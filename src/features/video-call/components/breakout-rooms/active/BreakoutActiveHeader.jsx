import React from "react"
import { Switch } from "@/shared/components/ui/inputs"
import ListItem from "@/shared/components/ui/ListItem"
import { useLanguage } from "@/shared/context/LanguageContext"

const BreakoutActiveHeader = ({
  status,
  isHost,
  isTogglingAllow,
  handleToggleAllowChange,
}) => {
  const { t } = useLanguage()

  return (
    <div className="py-2 border-b border-[#e5e5e5]">
      <ListItem
        contentClassName="!h-12"
        rightContent={
          <Switch
            checked={Boolean(status?.allowParticipantChangeRoom)}
            onChange={(e) => handleToggleAllowChange(e.target.checked)}
            disabled={!isHost || isTogglingAllow}
            colorClass="peer-checked:bg-emerald-500 peer-checked:border-emerald-600"
          />
        }
      >
        <span>{t.rooms.breakoutRooms.allowChangeRoom}</span>
      </ListItem>
    </div>
  )
}

export default BreakoutActiveHeader
