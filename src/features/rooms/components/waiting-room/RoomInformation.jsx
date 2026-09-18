import React from "react"
import ParticipantsPreview from "./ParticipantsPreview"
import { useLanguage } from "@/shared/context/LanguageContext"

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
      <h4 className="mb-1.5 sm:mb-2 font-semibold text-lg sm:text-xl md:text-2xl">
        {session?.roomName || t.rooms.waitingScreen.readyToJoin}
      </h4>

      {(room?.requiredLevel || room?.topic) && (
        <div className="flex flex-wrap justify-center gap-2 sm:gap-[11px] mb-2 sm:mb-3 mt-1.5 sm:mt-2">
          {room?.requiredLevel && (
            <span className="rounded-lg bg-cath-red-700 px-[15px] py-1.5 sm:py-2.5 text-[14px] font-bold uppercase tracking-wider leading-none text-white">
              {t?.rooms?.filters?.levels?.[
                room.requiredLevel?.toLowerCase()
              ] || room.requiredLevel}
            </span>
          )}
          {room?.topic &&
            room.topic.split(",").map((t_topic) => {
              const trimmed = t_topic.trim()
              return (
                  <span
                    key={trimmed}
                    className="rounded-lg bg-cath-red-700 px-[15px] py-1.5 sm:py-2.5 text-[14px] font-bold tracking-wider leading-none text-white"
                  >
                  {t.rooms.createRoom?.topics?.[trimmed.toLowerCase()] ||
                    trimmed}
                </span>
              )
            })}
        </div>
      )}

      <ParticipantsPreview
        participants={participants}
        participantCount={participantCount}
      />
    </div>
  )
}

export default RoomInformation
