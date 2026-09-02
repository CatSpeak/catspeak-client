import { motion as Motion } from "framer-motion"
import { Bot } from "lucide-react"
import { useParams } from "react-router-dom"
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
  currentLang,
}) => {
  const { t } = useLanguage()
  const { lang: paramLang } = useParams()
  const effectiveLang = currentLang ?? paramLang
  const isZhCommunity = effectiveLang === "zh"
  const voxisUrl = `https://voxis.click/speaking?ref=catspeak&lang=${effectiveLang || "zh"}`
  const handleVoxisClick = () => {
    window.open(voxisUrl, "_blank", "noopener,noreferrer")
  }

  return (
    <div className="relative mt-4">
      <div className="relative flex flex-col sm:flex-row sm:flex-wrap gap-4 mt-2">
        {badges.map((b) => {
          const Icon = b.icon
          const isOneOnOne = b.id === "connect_1_1"
          const isStudyGroup = b.id === "connect_2_5"
          const isAI = b.id === "your_ai"
          const isCustomRoom = b.id === "custom_room"

          if (isAI) return null

          const isActionable =
            isOneOnOne || isStudyGroup || isAI || isCustomRoom

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
            <Motion.div
              key={b.id}
              className={`flex items-center w-full sm:w-auto`}
              onClick={isActionable ? handleClick : undefined}
            >
              <Button3D
                disabled={!isActionable || isLoadingThis}
                loading={isActionable && isLoadingThis}
                className="w-full sm:w-auto sm:min-w-[140px]"
                roundedClass="rounded-xl"
              >
                {label}
              </Button3D>
            </Motion.div>
          )
        })}
        {isZhCommunity && (
          <Motion.div
            className="flex items-center w-full sm:w-auto"
            onClick={handleVoxisClick}
          >
            <Button3D
              aria-label={t.rooms?.sessionActions?.aiChat || "Trò chuyện với AI"}
              startIcon={<Bot className="w-4 h-4" />}
              className="w-full sm:w-auto sm:min-w-[140px]"
              roundedClass="rounded-xl"
            >
              {t.rooms?.sessionActions?.aiChat || "Trò chuyện với AI"}
            </Button3D>
          </Motion.div>
        )}
      </div>
    </div>
  )
}
export default SessionActionButtons
