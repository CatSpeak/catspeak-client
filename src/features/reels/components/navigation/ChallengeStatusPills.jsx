import React from "react"
import { Flame, Trophy } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { PillButton } from "@/shared/components/ui/buttons"

export default function ChallengeStatusPills({ challengeStatus, setChallengeStatus, onSelectChallenge }) {
  const { t } = useLanguage()

  return (
    <div className="flex gap-4 mb-4">
      <PillButton
        variant={challengeStatus === "active" ? "outline" : "secondary"}
        startIcon={<Flame size={18} />}
        onClick={() => {
          setChallengeStatus("active")
          if (onSelectChallenge) onSelectChallenge(null)
        }}
      >
        {t?.catSpeak?.reels?.active || "Đang diễn ra"}
      </PillButton>
      <PillButton
        variant={challengeStatus === "past" ? "outline" : "secondary"}
        startIcon={<Trophy size={18} />}
        onClick={() => {
          setChallengeStatus("past")
          if (onSelectChallenge) onSelectChallenge(null)
        }}
      >
        {t?.catSpeak?.reels?.past || "Đã kết thúc"}
      </PillButton>
    </div>
  )
}
