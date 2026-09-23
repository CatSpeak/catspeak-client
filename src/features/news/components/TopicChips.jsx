import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "@/shared/context/LanguageContext";


const TopicChips = ({ topics = [], className = "", onTopicClick }) => {
  const navigate = useNavigate();
  const { lang: paramLang } = useParams();
  const { language } = useLanguage();
  const currentLang = paramLang || language || "vi";

  if (!Array.isArray(topics) || topics.length === 0) {
    return null;
  }

  const handleChipClick = (e, topic) => {
    e.preventDefault();
    e.stopPropagation();

    if (onTopicClick) {
      onTopicClick(topic);
      return;
    }

    const topicId = topic.topicId ?? topic.TopicId ?? topic.id;
    if (topicId !== undefined && topicId !== null) {
      navigate(`/${currentLang}/cat-speak/news?topicIds=${topicId}`);
    }
  };

  return (
    <div
      className={`flex flex-wrap items-center gap-1.5 ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {topics.map((topic, index) => {
        const id = topic.topicId ?? topic.TopicId ?? topic.id ?? index;
        const title = topic.title || topic.Title || topic.slug || "";
        if (!title) return null;

        return (
          <span
            key={id}
            role="button"
            tabIndex={0}
            onClick={(e) => handleChipClick(e, topic)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleChipClick(e, topic);
              }
            }}
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/20 text-primary border-none shadow-none cursor-pointer transition-opacity hover:opacity-80 select-none"
            title={`#${title}`}
          >
            #{title}
          </span>
        );
      })}
    </div>
  );
};

export default TopicChips;
