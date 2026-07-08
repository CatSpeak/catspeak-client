import React from "react"
import { RefreshCw, Trash2 } from "lucide-react"
import { PillButton } from "@/shared/components/ui/buttons"
import NumberStepper from "@/shared/components/ui/inputs/NumberStepper"
import Switch from "@/shared/components/ui/inputs/Switch"
import ListItem from "@/shared/components/ui/ListItem"

const BreakoutSetupControls = ({
  roomCount,
  setRoomCount,
  handleShuffle,
  handleClearAll,
  maxParticipantsEnabled,
  setMaxParticipantsEnabled,
  maxParticipants,
  setMaxParticipants,
}) => {
  return (
    <div className="py-2">
      <ListItem
        rightContent={
          <Switch
            checked={maxParticipantsEnabled}
            onChange={(e) => setMaxParticipantsEnabled(e.target.checked)}
            colorClass="peer-checked:bg-emerald-500 peer-checked:border-emerald-600"
          />
        }
      >
        <span>Giới hạn thành viên</span>
      </ListItem>

      {maxParticipantsEnabled && (
        <div className="px-4">
          <NumberStepper
            value={maxParticipants}
            onChange={setMaxParticipants}
            min={1}
            className="w-full"
          />
        </div>
      )}

      <ListItem>
        <span>Số lượng phòng</span>
      </ListItem>

      <div className="px-4">
        <NumberStepper
          value={roomCount}
          onChange={setRoomCount}
          min={2}
          max={6}
          className="w-full"
        />
      </div>

      <div className="p-4 flex gap-2">
        <PillButton
          onClick={handleShuffle}
          variant="secondary"
          startIcon={<RefreshCw />}
          className="flex-1"
        >
          Trộn
        </PillButton>
        <PillButton
          onClick={handleClearAll}
          variant="outline"
          startIcon={<Trash2 />}
          className="flex-1"
        >
          Xóa hết
        </PillButton>
      </div>
    </div>
  )
}

export default BreakoutSetupControls
