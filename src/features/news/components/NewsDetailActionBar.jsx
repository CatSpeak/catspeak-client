import React, { useState, useRef } from "react";
import { MessageSquare, ThumbsUp } from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import ReactionsPopover from "@/shared/components/ui/ReactionsPopover";
import { ReactionBadge, NEWS_REACTIONS } from "./FacebookReactionBadge";
import ReactionStackedBadges from "./ReactionStackedBadges";
import {
  normalizeReactions,
  getTotalReactionsCount,
} from "../utils/reactionUtils";
import { useGetPostReactionsQuery } from "@/store/api/social/postsApi";

const NewsDetailActionBar = ({
  newsItem,
  reactions: propReactions,
  handleReact,
  handleShare,
  onCommentClick,
}) => {
  const { t } = useLanguage();
  const [showReactions, setShowReactions] = useState(false);
  const holdTimer = useRef(null);

  const postId = newsItem?.postId;
  const { data: fetchedReactions } = useGetPostReactionsQuery(postId, {
    skip: !postId || Boolean(propReactions),
  });
  const reactions = propReactions || fetchedReactions;

  const handleTouchStart = () => {
    holdTimer.current = setTimeout(() => setShowReactions(true), 400);
  };

  const handleTouchEnd = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
  };

  const getReactionLabel = () => {
    if (newsItem?.currentUserReaction === "Love")
      return t.news?.newsDetail?.love || "Yêu";
    if (newsItem?.currentUserReaction === "Haha")
      return t.news?.newsDetail?.haha || "Haha";
    return t.news?.newsDetail?.like || "Thích";
  };

  const normalized = normalizeReactions(reactions);
  const totalReactions = getTotalReactionsCount(
    normalized,
    newsItem?.totalReactions !== undefined && newsItem?.totalReactions !== null
      ? newsItem.totalReactions
      : 0,
  );
  const totalComments = newsItem?.totalComments ?? newsItem?.commentCount ?? 0;
  const shareCount = newsItem?.totalShares ?? newsItem?.shareCount ?? 0;

  return (
    <div className="border-t border-[#e2e2e2] pt-3.5 pb-1 flex items-center justify-between gap-3">
      {/* ── Left: Action buttons (react · comment · share) ─────── */}
      <div className="flex items-center gap-5 sm:gap-6">
        {/* Like / Reactions button */}
        <div
          className={`group/reactions relative flex items-center justify-center overflow-visible ${
            showReactions ? "z-50" : ""
          }`}
          onMouseEnter={() => setShowReactions(true)}
          onMouseLeave={() => setShowReactions(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchMove={handleTouchEnd}
        >
          <button
            type="button"
            onClick={() => {
              const type = newsItem?.currentUserReaction || "Like";
              handleReact(type);
            }}
            className="p-1.5 -m-1.5 rounded-full hover:bg-gray-100 transition-colors flex items-center gap-1.5 text-[#4b5563] hover:text-black cursor-pointer"
            aria-label={getReactionLabel()}
          >
            {newsItem?.currentUserReaction ? (
              <ReactionBadge
                type={newsItem.currentUserReaction}
                size={22}
              />
            ) : (
              <ThumbsUp size={22} strokeWidth={1.8} className="text-[#4b5563]" />
            )}
            <span className="text-sm font-medium text-gray-700">
              {totalReactions}
            </span>
          </button>

          {/* Reactions Popover - Centered & aligned with consistent icons */}
          <ReactionsPopover
            show={showReactions}
            onClose={() => setShowReactions(false)}
            onSelect={(_, type) => handleReact(type)}
            reactions={NEWS_REACTIONS}
            iconSize={22}
            className="mb-2"
          />
        </div>

        {/* Comment button */}
        <button
          type="button"
          onClick={onCommentClick}
          className="p-1.5 -m-1.5 rounded-full hover:bg-gray-100 transition-colors flex items-center gap-1.5 text-[#4b5563] hover:text-black cursor-pointer"
          title={t.news?.newsDetail?.comment || "Bình luận"}
        >
          <MessageSquare size={22} strokeWidth={1.8} />
          <span className="text-sm font-medium text-gray-700">
            {totalComments}
          </span>
        </button>

        {/* Share button */}
        <button
          type="button"
          onClick={handleShare}
          className="p-1.5 -m-1.5 rounded-full hover:bg-gray-100 transition-colors flex items-center gap-1.5 text-[#4b5563] hover:text-black cursor-pointer"
          title={t.news?.newsDetail?.share || "Chia sẻ"}
        >
          {/* Curved forward / share arrow matching Figma and Image 1 */}
          <svg
            viewBox="0 0 24 24"
            className="w-[22px] h-[22px]"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 9V5L21 12L14 19V14.9C9 14.9 5.5 16.5 3 20C4 15 7 10 14 9Z" />
          </svg>
          <span className="text-sm font-medium text-gray-700">
            {shareCount}
          </span>
        </button>
      </div>

      {/* ── Right: Stacked reaction badges (Like · Love · Haha) ── */}
      <ReactionStackedBadges
        postId={postId}
        reactions={reactions}
        totalReactions={totalReactions}
      />
    </div>
  );
};

export default NewsDetailActionBar;
