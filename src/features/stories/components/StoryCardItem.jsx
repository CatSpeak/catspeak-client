import React from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { MessageSquare, AlertCircle } from "lucide-react";
import Avatar from "@/shared/components/ui/Avatar";
import { useTimezone } from "@/shared/hooks/useTimezone";
import { useLanguage } from "@/shared/context/LanguageContext";

dayjs.extend(relativeTime);

const StoryCardItem = ({ story, onClick }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { formatRelative } = useTimezone();
  if (!story) return null;

  const {
    storyContent,
    username,
    avatarImageUrl,
    // commentCount = 0,
    createDate,
  } = story;

  const authorAccountId = story.accountId || story.userId || story.authorId;

  const relativeCreatedAt = createDate ? formatRelative(createDate) : null;

  const CARD_THEMES = [
    { bg: "bg-[#FFEEF0]" },
    { bg: "bg-[#FFFCEB]" },
    { bg: "bg-[#FFF2EA]" },
    { bg: "bg-[#F1FFF8]" },
    { bg: "bg-[#F6F2FF]" },
    { bg: "bg-[#FDF3FF]" },
    { bg: "bg-[#FFFBFC]" },
  ];

  const themeIndex = (story.storyId || 0) % CARD_THEMES.length;
  const theme = CARD_THEMES[themeIndex];

  return (
    <div
      onClick={onClick}
      className={`relative flex md:max-w-[240px] w-full max-h-[164px] cursor-pointer flex-col gap-2 rounded-2xl border p-4 shadow-faq-card transition-all ${theme.bg} ${story.isReported ? "border-amber-400/80" : ""}`}
    >
      {story.isReported && (
        <span
          className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow-md z-10"
          title={t.catSpeak?.reportedTooltip || t.catSpeak?.reportedWarning || "Bị báo cáo"}
        >
          <AlertCircle size={13} strokeWidth={2.5} />
        </span>
      )}
      {/* Header: avatar + username */}
      <div className="flex items-center gap-2.5">
        <Avatar src={avatarImageUrl} name={username || "Anonymous"} size={36} accountId={authorAccountId} />
        <div className="min-w-0 flex-1">
          <p
            onClick={(e) => {
              if (authorAccountId) {
                e.stopPropagation();
                navigate(`/profile/${authorAccountId}`);
              }
            }}
            className={`truncate text-sm font-semibold text-[#1a1a1a] ${authorAccountId ? "hover:underline hover:text-cath-red-700 transition-colors cursor-pointer" : ""}`}
          >
            {username || "Anonymous"}
          </p>
          {username && (
            <p className="truncate text-xs text-[#9e9e9e]">
              @{username.toLowerCase().replace(/\s+/g, "")}
            </p>
          )}
        </div>
      </div>

      {/* Story content */}
      <p className="line-clamp-3 flex-1 break-words text-sm leading-[1.4] text-[#3d3d3d]">
        {storyContent}
      </p>

      {/* Footer: comment count + time */}
      <div className="flex items-center gap-4 text-xs text-[#9e9e9e] mt-auto">
        {/* <span className="flex items-center gap-1">
          <MessageSquare size={13} className="shrink-0" />
          {commentCount} {t.story?.replies}
        </span> */}

        {relativeCreatedAt && (
          <span className="ml-auto shrink-0">{relativeCreatedAt}</span>
        )}
      </div>
    </div>
  );
};

export default StoryCardItem;
