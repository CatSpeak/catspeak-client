import React from "react"
import ParticipantsPreview from "./ParticipantsPreview"
import { useLanguage } from "@/shared/context/LanguageContext"
import { Badge } from "@/shared/components/ui/indicators"

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
      <h4 className="font-bold text-lg">
        {session?.roomName || t.rooms.waitingScreen.readyToJoin}
      </h4>

      {(room?.requiredLevel || room?.topic) && (
        <div className="flex flex-wrap justify-center gap-1 mb-2">
          {room?.requiredLevel && (
            <Badge color="cath-red" className="uppercase tracking-wider">
              {t?.rooms?.filters?.levels?.[room.requiredLevel?.toLowerCase()] ||
                room.requiredLevel}
            </Badge>
          )}
          {room?.topic &&
            room.topic.split(",").map((t_topic) => {
              const trimmed = t_topic.trim()
              return (
                <Badge key={trimmed} color="cath-red">
                  {t.rooms.createRoom?.topics?.[trimmed.toLowerCase()] ||
                    trimmed}
                </Badge>
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
