import React from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import Avatar from "@/shared/components/ui/Avatar"
import { filterHumanParticipants } from "@/features/video-call/utils/participantIdentity"

const ParticipantsPreview = ({ participants = [], participantCount }) => {
  const { t } = useLanguage()
  // BE counts are human-only; filter again for stale caches / mixed lists.
  const humanParticipants = filterHumanParticipants(participants)
  const count = participantCount ?? humanParticipants.length

  if (count === 0) {
    return (
      <p className="text-[#7A7574] dark:text-[#AAAAAA]">
        {t.rooms.waitingScreen.noOneHere}
      </p>
    )
  }

  const MAX_VISIBLE = 5
  const visibleParticipants = humanParticipants.slice(0, MAX_VISIBLE)
  const remainingCount = Math.max(0, count - visibleParticipants.length)

  return (
    <div className="flex w-full flex-col items-center">
      {/* Participant List - Overlapping Avatars */}
      <div className="mb-1 flex flex-row items-center justify-center">
        {visibleParticipants.map((p, index) => (
          <div
            key={p.accountId || index}
            title={p.username}
            className={`relative ${index !== 0 ? "-ml-3" : ""}`}
          >
            <Avatar
              src={p.avatarUrl}
              name={p.username || "User"}
              size={44}
              className="border-2 border-white dark:border-[#1A1A1A] shadow-sm"
            />
          </div>
        ))}
        {remainingCount > 0 && (
          <div
            className={`z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white dark:border-[#1A1A1A] bg-gray-100 dark:bg-neutral-800 text-xs font-semibold text-gray-600 dark:text-gray-300 shadow-sm ${visibleParticipants.length > 0 ? "-ml-3" : ""}`}
          >
            +{remainingCount}
          </div>
        )}
      </div>

      {/* Meta Text */}
      <p className="text-sm text-secondary dark:text-[#AAAAAA]">
        <span>{count}</span> {t.rooms.waitingScreen.isHere}
      </p>
    </div>
  )
}

export default ParticipantsPreview
