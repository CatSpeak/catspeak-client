import { motion } from "framer-motion"
import { badges } from "@/shared/constants/constants"
import { useLanguage } from "@/shared/context/LanguageContext"
import Button3D from "@/shared/components/ui/buttons/Button3D"

const SessionActionButtons = ({
  handleCreateOneOnOneSession,
  handleCreateStudyGroupSession,
  handleCreateAISession,
  isCreatingOneOnOne,
  isCreatingStudyGroup,
  isCreatingAI,
  canUseAI,
}) => {
  const { t } = useLanguage()

  return (
    <div className="relative mt-5">
      <div className="relative flex flex-col min-[426px]:flex-row min-[426px]:flex-wrap gap-3 sm:gap-4 mt-2">
        {badges.map((b) => {
          const Icon = b.icon
          const isOneOnOne = b.id === "connect_1_1"
          const isStudyGroup = b.id === "connect_2_5"
          const isAI = b.id === "your_ai"

          if (isAI && !canUseAI) return null

          const isActionable = isOneOnOne || isStudyGroup || isAI

          const handleClick = () => {
            if (isOneOnOne) handleCreateOneOnOneSession()
            if (isStudyGroup) handleCreateStudyGroupSession()
            if (isAI) handleCreateAISession()
          }

          const isLoadingThis =
            (isOneOnOne && isCreatingOneOnOne) ||
            (isStudyGroup && isCreatingStudyGroup) ||
            (isAI && isCreatingAI)

          // Map IDs to translation keys
          let labelKey = ""
          if (isOneOnOne) labelKey = "connect11"
          if (isStudyGroup) labelKey = "connect25"
          if (isAI) labelKey = "yourAI"

          const label = labelKey ? t.rooms.sessionActions[labelKey] : b.label

          return (
            <motion.div
              key={b.id}
              className={`flex items-center w-full min-[426px]:w-auto`}
              onClick={isActionable ? handleClick : undefined}
            >
              <Button3D
                disabled={!isActionable || isLoadingThis}
                loading={isActionable && isLoadingThis}
                startIcon={<Icon className="w-5 h-5" />}
                className="w-full min-[426px]:w-auto min-[426px]:min-w-[140px]"
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
