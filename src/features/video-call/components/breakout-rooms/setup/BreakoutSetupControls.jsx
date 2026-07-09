import React from "react"
import { RefreshCw, RotateCcw } from "lucide-react"
import { PillButton } from "@/shared/components/ui/buttons"
import NumberStepper from "@/shared/components/ui/inputs/NumberStepper"
import Switch from "@/shared/components/ui/inputs/Switch"
import ListItem from "@/shared/components/ui/ListItem"
import { useLanguage } from "@/shared/context/LanguageContext"

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
  const { t } = useLanguage()

  return (
    <div>
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
          <span>{t.rooms.breakoutRooms.memberLimit}</span>
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
          <span>{t.rooms.breakoutRooms.roomCount}</span>
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
      </div>

      <div className="p-4 flex gap-2">
        <PillButton
          onClick={handleShuffle}
          variant="secondary"
          startIcon={<RefreshCw />}
          className="flex-1"
        >
          {t.rooms.breakoutRooms.shuffleBtn}
        </PillButton>
        <PillButton
          onClick={handleClearAll}
          variant="outline"
          startIcon={<RotateCcw />}
          className="flex-1"
        >
          {t.rooms.breakoutRooms.resetBtn}
        </PillButton>
      </div>
    </div>
  )
}

export default BreakoutSetupControls
