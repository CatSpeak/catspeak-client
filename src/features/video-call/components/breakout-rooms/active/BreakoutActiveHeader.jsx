import React from "react"
import { Switch } from "@/shared/components/ui/inputs"
import ListItem from "@/shared/components/ui/ListItem"

const BreakoutActiveHeader = ({
  status,
  isHost,
  isTogglingAllow,
  handleToggleAllowChange,
}) => {
  return (
    <div className="py-2 border-b border-[#e5e5e5]">
      <ListItem
        rightContent={
          <Switch
            checked={Boolean(status?.allowParticipantChangeRoom)}
            onChange={(e) => handleToggleAllowChange(e.target.checked)}
            disabled={!isHost || isTogglingAllow}
            colorClass="peer-checked:bg-emerald-500 peer-checked:border-emerald-600"
          />
        }
      >
        <span>Cho phép đổi phòng</span>
      </ListItem>
    </div>
  )
}

export default BreakoutActiveHeader
