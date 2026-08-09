import { motion } from "framer-motion"
import { badges } from "@/shared/constants/constants"
import { useLanguage } from "@/shared/context/LanguageContext"
import Button3D from "@/shared/components/ui/buttons/Button3D"

const SessionActionButtons = ({
  handleCreateOneOnOneSession,
  handleCreateStudyGroupSession,
  handleCreateAISession,
  handleCreateCustomRoomSession,
  isCreatingOneOnOne,
  isCreatingStudyGroup,
  isCreatingAI,
  isCreatingCustom,
  canUseAI,
}) => {
  const { t } = useLanguage()

  return (
    <div className="relative mt-5">
      <div className="relative flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 mt-2">
        {badges.map((b) => {
          const Icon = b.icon
          const isOneOnOne = b.id === "connect_1_1"
          const isStudyGroup = b.id === "connect_2_5"
          const isAI = b.id === "your_ai"
          const isCustomRoom = b.id === "custom_room"

          if (isAI) return null

          const isActionable = isOneOnOne || isStudyGroup || isAI || isCustomRoom

          const handleClick = () => {
            if (isOneOnOne) handleCreateOneOnOneSession()
            if (isStudyGroup) handleCreateStudyGroupSession()
            if (isAI) handleCreateAISession()
            if (isCustomRoom) handleCreateCustomRoomSession?.()
          }

          const isLoadingThis =
            (isOneOnOne && isCreatingOneOnOne) ||
            (isStudyGroup && isCreatingStudyGroup) ||
            (isAI && isCreatingAI) ||
            (isCustomRoom && isCreatingCustom)

          // Map IDs to translation keys
          let labelKey = ""
          if (isOneOnOne) labelKey = "connect11"
          if (isStudyGroup) labelKey = "connect25"
          if (isAI) labelKey = "yourAI"
          if (isCustomRoom) labelKey = "customRoom"

          const label = labelKey ? t.rooms.sessionActions[labelKey] : b.label

          return (
            <motion.div
              key={b.id}
              className={`flex items-center w-full sm:w-auto`}
              onClick={isActionable ? handleClick : undefined}
            >
              <Button3D
                disabled={!isActionable || isLoadingThis}
                loading={isActionable && isLoadingThis}
                className="w-full sm:w-auto sm:min-w-[140px]"
                roundedClass="rounded-full"
              >
                {label}
              </Button3D>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
export default SessionActionButtons
