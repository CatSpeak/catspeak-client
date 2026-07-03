import React from "react"
import { Flame, Trophy } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"

export default function ChallengeStatusPills({ challengeStatus, setChallengeStatus, onSelectChallenge }) {
  const { t } = useLanguage()

  return (
    <div className="flex gap-4 mb-4">
      <button 
        onClick={() => {
          setChallengeStatus("active")
          if (onSelectChallenge) onSelectChallenge(null)
        }}
        className={`px-5 py-2.5 rounded-full font-bold text-[14px] flex items-center gap-2 transition-all ${
          challengeStatus === "active" 
            ? "bg-red-50 text-cath-red-700 border border-red-100" 
            : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
        }`}
      >
        <Flame size={18} className={challengeStatus === "active" ? "text-cath-red-700" : "text-gray-400"} />
        <span>{t?.catSpeak?.reels?.active || "Đang diễn ra"}</span>
      </button>
      <button 
        onClick={() => {
          setChallengeStatus("past")
          if (onSelectChallenge) onSelectChallenge(null)
        }}
        className={`px-5 py-2.5 rounded-full font-bold text-[14px] flex items-center gap-2 transition-all ${
          challengeStatus === "past" 
            ? "bg-red-50 text-cath-red-700 border border-red-100" 
            : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
        }`}
      >
        <Trophy size={18} className={challengeStatus === "past" ? "text-cath-red-700" : "text-gray-400"} />
        <span>{t?.catSpeak?.reels?.past || "Đã kết thúc"}</span>
      </button>
    </div>
  )
}
