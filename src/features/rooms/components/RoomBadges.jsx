import React from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import Badge from "@/shared/components/ui/indicators/Badge"
import {
  formatLevel,
  formatTopic,
  getValidRoomTopics,
} from "@/features/rooms/utils/formatters"

/**
 * Shared RoomBadges component to display room level and/or topic badges.
 * Automatically filters out generic "Other" / "Khác" topic tags (DRY rule).
 *
 * @param {Object} room - The room data object (must contain requiredLevel, topic or topics).
 * @param {boolean} [showLevel=true] - Whether to render the requiredLevel badge.
 * @param {boolean} [showTopics=true] - Whether to render topic badges.
 * @param {number} [maxTopics] - Maximum number of valid topic badges to show (e.g. 1 on cards).
 * @param {string} [className] - Optional container wrapper className. If omitted, renders fragment.
 * @param {string} [badgeClassName=""] - Extra className applied to both level and topic badges.
 * @param {string} [levelClassName="uppercase tracking-wider"] - Extra className for the level badge.
 * @param {string} [topicClassName="uppercase tracking-wider"] - Extra className for topic badges.
 * @param {string} [badgeColor="cath-red"] - Color variant passed to Badge.
 * @param {string} [badgeSize="sm"] - Size variant passed to Badge.
 */
const RoomBadges = ({
  room,
  showLevel = true,
  showTopics = true,
  maxTopics,
  className,
  badgeClassName = "",
  levelClassName = "uppercase tracking-wider",
  topicClassName = "uppercase tracking-wider",
  badgeColor = "cath-red",
  badgeSize = "sm",
}) => {
  const { t } = useLanguage()

  if (!room) return null

  const hasLevel = showLevel && Boolean(room.requiredLevel)
  const validTopics = showTopics ? getValidRoomTopics(room) : []
  const visibleTopics =
    typeof maxTopics === "number"
      ? validTopics.slice(0, maxTopics)
      : validTopics

  if (!hasLevel && visibleTopics.length === 0) return null

  const content = (
    <>
      {hasLevel && (
        <Badge
          color={badgeColor}
          size={badgeSize}
          title={
            t?.rooms?.filters?.levels?.[room.requiredLevel?.toLowerCase()] ||
            `${t?.rooms?.filters?.levelLabel || "Trình độ"}: ${room.requiredLevel}`
          }
          className={`${levelClassName} ${badgeClassName}`.trim()}
        >
          {formatLevel(room.requiredLevel, t)}
        </Badge>
      )}
      {visibleTopics.map((topic) => {
        const label = formatTopic(topic, t)
        return (
          <Badge
            key={topic}
            color={badgeColor}
            size={badgeSize}
            title={label}
            className={`${topicClassName} ${badgeClassName}`.trim()}
          >
            {label}
          </Badge>
        )
      })}
    </>
  )

  if (className) {
    return <div className={className}>{content}</div>
  }

  return content
}

export default RoomBadges

