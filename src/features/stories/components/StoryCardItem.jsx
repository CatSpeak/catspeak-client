import React from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { AlertCircle } from "lucide-react";
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
    createDate,
  } = story;

  const authorAccountId = story.accountId || story.userId || story.authorId;
  const relativeCreatedAt = createDate ? formatRelative(createDate) : null;

  const CARD_THEMES = [
    {
      bg: "bg-[#FFF2EA]/60",
      bgHover: "hover:bg-[#FFF2EA]/90",
      text: "text-[#B34700]",
      border: "border-[#FFF2EA]/60",
    },
    {
      bg: "bg-[#FFEAED]/60",
      bgHover: "hover:bg-[#FFEAED]/90",
      text: "text-[#990011]",
      border: "border-[#FFEAED]/60",
    },
    {
      bg: "bg-[#FFF9CC]/60",
      bgHover: "hover:bg-[#FFF9CC]/90",
      text: "text-[#E2B60A]",
      border: "border-[#FFF9CC]/60",
    },
    {
      bg: "bg-[#B2FFD6]/50",
      bgHover: "hover:bg-[#B2FFD6]/80",
      text: "text-[#16A34A]",
      border: "border-[#B2FFD6]/60",
    },
    {
      bg: "bg-[#E8F2FF]/60",
      bgHover: "hover:bg-[#E8F2FF]/90",
      text: "text-[#1D7DFD]",
      border: "border-[#E8F2FF]/60",
    },
    {
      bg: "bg-[#F6F2FF]/60",
      bgHover: "hover:bg-[#F6F2FF]/90",
      text: "text-[#6D49BF]",
      border: "border-[#F6F2FF]/60",
    },
  ];

  const themeIndex = (story.storyId || 0) % CARD_THEMES.length;
  const theme = CARD_THEMES[themeIndex];

  const isOwn = story.isOwn;
  const bgClass = isOwn ? "bg-blue-50/70 hover:bg-blue-100/90" : `${theme.bg} ${theme.bgHover}`;
  const borderClass = story.isReported
    ? "border-amber-400/80 ring-1 ring-amber-400/30"
    : isOwn
      ? "border-blue-200"
      : theme.border;

  return (
    <div
      onClick={onClick}
      className={`relative flex md:max-w-[240px] w-full max-h-[164px] cursor-pointer flex-col gap-2 rounded-2xl border p-4 shadow-faq-card transition-all backdrop-blur-sm ${bgClass} ${borderClass}`}
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

      {/* Footer: time */}
      <div className="flex items-center gap-4 text-xs text-[#9e9e9e] mt-auto">
        {relativeCreatedAt && (
          <span className="ml-auto shrink-0">{relativeCreatedAt}</span>
        )}
      </div>
    </div>
  );
};

export default StoryCardItem;
