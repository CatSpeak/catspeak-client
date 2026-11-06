import React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import Badge from "@/shared/components/ui/indicators/Badge"

const TopicChips = ({
  topics = [],
  className = "",
  onTopicClick,
  overlay = false,
  maxVisible,
  size = "md",
  color,
}) => {
  const navigate = useNavigate()
  const { lang: paramLang } = useParams()
  const { language } = useLanguage()
  const currentLang = paramLang || language || "vi"

  if (!Array.isArray(topics) || topics.length === 0) {
    return null
  }

  const visibleTopics = maxVisible ? topics.slice(0, maxVisible) : topics

  const handleChipClick = (e, topic) => {
    e.preventDefault()
    e.stopPropagation()

    if (onTopicClick) {
      onTopicClick(topic)
      return
    }

    const topicId = topic.topicId ?? topic.TopicId ?? topic.id
    if (topicId !== undefined && topicId !== null) {
      navigate(`/${currentLang}/cat-speak/news?topicIds=${topicId}`)
    }
  }

  const badgeColor = color || (overlay ? "dark-frosted" : "cath-red")

  return (
    <div
      className={`flex flex-wrap items-center gap-2 ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {visibleTopics.map((topic, index) => {
        const id = topic.topicId ?? topic.TopicId ?? topic.id ?? index
        const title = topic.title || topic.Title || topic.slug || ""
        if (!title) return null

        return (
          <Badge
            key={id}
            color={badgeColor}
            size={size}
            role="button"
            tabIndex={0}
            onClick={(e) => handleChipClick(e, topic)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleChipClick(e, topic)
              }
            }}
            className="!cursor-pointer transition-opacity hover:opacity-80 select-none"
            title={`#${title}`}
          >
            #{title}
          </Badge>
        )
      })}
    </div>
  )
}

export default TopicChips
