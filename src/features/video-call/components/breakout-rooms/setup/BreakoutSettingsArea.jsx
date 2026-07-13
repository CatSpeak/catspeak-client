import React from "react"
import Switch from "@/shared/components/ui/inputs/Switch"
import NumberStepper from "@/shared/components/ui/inputs/NumberStepper"
import ListItem from "@/shared/components/ui/ListItem"
import { useLanguage } from "@/shared/context/LanguageContext"

const BreakoutSettingsArea = ({
  allowChangeRoom,
  setAllowChangeRoom,
  timerEnabled,
  setTimerEnabled,
  timerDuration,
  setTimerDuration,
}) => {
  const { t } = useLanguage()

  return (
    <div className="py-2">
      {/* Allow participants to change room */}
      <ListItem
        rightContent={
          <Switch
            checked={allowChangeRoom}
            onChange={(e) => setAllowChangeRoom(e.target.checked)}
            colorClass="peer-checked:bg-emerald-500 peer-checked:border-emerald-600"
          />
        }
      >
        <span>{t.rooms.breakoutRooms.allowChangeRoom}</span>
      </ListItem>

      {/* Timer Switch */}
      <div>
        <ListItem
          rightContent={
            <Switch
              checked={timerEnabled}
              onChange={(e) => setTimerEnabled(e.target.checked)}
              colorClass="peer-checked:bg-emerald-500 peer-checked:border-emerald-600"
            />
          }
        >
          <span>{t.rooms.breakoutRooms.timerMinutes}</span>
        </ListItem>

        {timerEnabled && (
          <div className="px-4">
            <NumberStepper
              value={timerDuration}
              onChange={setTimerDuration}
              min={1}
              max={120}
              className="w-full"
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default BreakoutSettingsArea
