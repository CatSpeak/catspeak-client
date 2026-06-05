import React from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import Avatar from "@/shared/components/ui/Avatar"

const ParticipantsPreview = ({ participants = [], participantCount }) => {
  const { t } = useLanguage()
  const count = participantCount ?? participants.length

  if (count === 0) {
    return <p className="text-[#7A7574]">{t.rooms.waitingScreen.noOneHere}</p>
  }

  const MAX_VISIBLE = 5
  const visibleParticipants = participants.slice(0, MAX_VISIBLE)
  const remainingCount =
    participants.length > MAX_VISIBLE
      ? participants.length - MAX_VISIBLE
      : count > MAX_VISIBLE
        ? count - MAX_VISIBLE
        : 0

  return (
    <div className="flex w-full flex-col items-center">
      {/* Participant List - Overlapping Avatars */}
      <div className="mb-2 flex flex-row items-center justify-center">
        {visibleParticipants.map((p, index) => (
          <div key={p.accountId || index} title={p.username} className={`relative ${index !== 0 ? "-ml-3" : ""}`}>
            <Avatar
              src={p.avatarUrl}
              name={p.username || "User"}
              size={40}
              className="border-2 border-white shadow-sm"
            />
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="z-10 -ml-3 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-xs font-semibold text-gray-600 shadow-sm">
            +{remainingCount}
          </div>
        )}
      </div>

      {/* Meta Text */}
      <p className="text-sm text-[#606060]">
        <span className="font-medium text-gray-900">{count}</span>{" "}
        {t.rooms.waitingScreen.isHere}
      </p>
    </div>
  )
}

export default ParticipantsPreview
