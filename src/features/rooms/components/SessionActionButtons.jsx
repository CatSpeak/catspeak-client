import { useState } from "react"
import { motion } from "framer-motion"
import InDevelopmentModal from "@/shared/components/ui/InDevelopmentModal"
import { badges } from "@/shared/constants/constants"
import { useLanguage } from "@/shared/context/LanguageContext"
import Button3D from "@/shared/components/ui/buttons/Button3D"

const SessionActionButtons = ({
  handleCreateOneOnOneSession,
  handleCreateStudyGroupSession,
  isCreatingOneOnOne,
  isCreatingStudyGroup,
}) => {
  const { t } = useLanguage()
  const [isDevelopmentModalOpen, setIsDevelopmentModalOpen] = useState(false)

  return (
    <div className="relative mt-5">
      <InDevelopmentModal
        open={isDevelopmentModalOpen}
        onCancel={() => setIsDevelopmentModalOpen(false)}
      />
      {/* Line removed as requested */}
      <div className="relative flex flex-col min-[426px]:flex-row min-[426px]:flex-wrap gap-3 sm:gap-4 mt-2">
        {badges.map((b) => {
          const Icon = b.icon
          const isOneOnOne = b.id === "connect_1_1"
          const isStudyGroup = b.id === "connect_2_5"
          const isAI = b.id === "your_ai"

          const isActionable = isOneOnOne || isStudyGroup || isAI

          const handleClick = () => {
            if (isOneOnOne) handleCreateOneOnOneSession()
            if (isStudyGroup) handleCreateStudyGroupSession()
            if (isAI) setIsDevelopmentModalOpen(true)
          }

          const isLoadingThis =
            (isOneOnOne && isCreatingOneOnOne) ||
            (isStudyGroup && isCreatingStudyGroup)

          // Map IDs to translation keys
          let labelKey = ""
          if (isOneOnOne) labelKey = "connect11"
          if (isStudyGroup) labelKey = "connect25"
          if (isAI) labelKey = "yourAI"

          const label = labelKey ? t.rooms.sessionActions[labelKey] : b.label

          if (isAI) return null

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
