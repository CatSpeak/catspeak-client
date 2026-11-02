import React from "react"
import ParticipantsPreview from "./ParticipantsPreview"
import { useLanguage } from "@/shared/context/LanguageContext"
import { Badge } from "@/shared/components/ui/indicators"
import { getTopicMeta } from "@/features/rooms/utils/getTopicIcon"

const RoomInformation = ({
  session,
  room,
  participants,
  participantCount,
  className = "",
}) => {
  const { t } = useLanguage()

  const rawTopics = Array.isArray(room?.topics)
    ? room.topics
    : typeof room?.topic === "string"
      ? room.topic.split(",")
      : []

  // Filter out generic "Other" / "Khác" topics, matching CommunityRoomCard behavior
  const validTopics = rawTopics
    .map((t_topic) => String(t_topic || "").trim())
    .filter((trimmed) => {
      if (!trimmed) return false
      const lower = trimmed.toLowerCase()
      const { topicKey } = getTopicMeta(trimmed)
      const isOther =
        topicKey === "other" ||
        ["other", "others", "khác", "khac"].includes(lower)
      return !isOther
    })

  const hasLevel = Boolean(room?.requiredLevel)
  const hasBadges = hasLevel || validTopics.length > 0

  return (
    <div className={`text-center ${className}`}>
      <h4 className="font-bold text-xl dark:text-white mb-4">
        {session?.roomName || t.rooms.waitingScreen.readyToJoin}
      </h4>

      {hasBadges && (
        <div className="flex flex-wrap justify-center gap-1 mb-2">
          {hasLevel && (
            <Badge color="cath-red" className="uppercase tracking-wider">
              {t?.rooms?.filters?.levels?.[room.requiredLevel?.toLowerCase()] ||
                room.requiredLevel}
            </Badge>
          )}
          {validTopics.map((topic) => {
            const { topicKey } = getTopicMeta(topic)
            const topicLabel =
              t?.rooms?.createRoom?.topics?.[topic.toLowerCase()] ||
              t?.rooms?.filters?.topics?.[topicKey] ||
              topic

            return (
              <Badge key={topic} color="cath-red">
                {topicLabel}
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
