import React from "react"
import ParticipantsPreview from "./ParticipantsPreview"
import { useLanguage } from "@/shared/context/LanguageContext"
import RoomBadges from "@/features/rooms/components/RoomBadges"

const RoomInformation = ({
  session,
  room,
  participants,
  participantCount,
  className = "",
}) => {
  const { t } = useLanguage()

  return (
    <div className={`text-center ${className}`}>
      <h4 className="font-bold text-xl dark:text-white mb-4">
        {session?.roomName || t.rooms.waitingScreen.readyToJoin}
      </h4>

      <RoomBadges
        room={room}
        className="flex flex-wrap justify-center gap-1 mb-2"
      />

      <ParticipantsPreview
        participants={participants}
        participantCount={participantCount}
      />
    </div>
  )
}

export default RoomInformation
