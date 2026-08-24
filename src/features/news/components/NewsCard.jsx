import React, { useState, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "@/shared/context/LanguageContext";
import { COLORS } from "@/shared/constants/constants";
import { Share, MessageSquare } from "lucide-react";
import { useReactToPostMutation } from "@/store/api/social/postsApi";
import useSharePost from "@/shared/hooks/useSharePost";
import ShareModal from "./ShareModal";
import Carousel from "@/shared/components/ui/Carousel";
import { getImageUrl } from "@/shared/utils/imageUtils";
import { getTranslatedTimeAgo } from "@/features/news/utils/newsUtils";
import ReactionsPopover, {
  ReactionIcon,
} from "@/shared/components/ui/ReactionsPopover";
import { useAuthModal } from "@/shared/context/AuthModalContext";
import { useAuth } from "@/features/auth";

/**
 * NewsCard — Figma "Card_Bản tin Catspeak" layout.
 *
 * Structure (top → bottom):
 *   1. Image area with media carousel + Share / Bookmark overlay
 *   2. Title + date
 *   3. Stats row: likes · comments · views
 *   4. Share modal + reactions popover
 */
const NewsCard = ({ news }) => {
  const navigate = useNavigate();
  const { lang } = useParams();
  const currentLang = lang || "en";
  const { t } = useLanguage();
  const newsCard = t.news?.newsCard;
  const { isAuthenticated } = useAuth();
  const { openAuthModal } = useAuthModal();

  /* ── API mutations & hooks ───────────────────────────────────────── */
  const [reactToPost] = useReactToPostMutation();
  const {
    shareUrl,
    isShareModalOpen,
    setIsShareModalOpen,
    handleShare: triggerShare,
  } = useSharePost();

  /* ── Local state ───────────────────────────────────────────────── */
  const [showReactions, setShowReactions] = useState(false);
  const holdTimer = useRef(null);

  /* ── Derived ───────────────────────────────────────────────────── */
  const hasMedia = news.media && news.media.length > 0;

  const fallbackColor = useMemo(() => {
    const seed =
      news.postId ||
      (news.title
        ? news.title
            .split("")
            .reduce((acc, char) => acc + char.charCodeAt(0), 0)
        : 0);
    const index =
      typeof seed === "number"
        ? seed % COLORS.length
        : seed.length % COLORS.length;
    return COLORS[index].value;
  }, [news.postId, news.title]);

  /* ── Handlers ──────────────────────────────────────────────────── */
  const handleCardClick = () => {
    navigate(`/${currentLang}/cat-speak/news/${news.slug || news.postId}`);
  };

  const handleShare = (e) => {
    triggerShare(e, news?.postId);
  };

  const handleReact = (e, type) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();

    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }

    const id = news?.postId || news?.id;
    if (!id) return;

    reactToPost({ postId: id, type });
  };

  const handleTouchStart = () => {
    holdTimer.current = setTimeout(() => setShowReactions(true), 400);
  };

  const handleTouchEnd = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
  };

  /* ── Derived: carousel images ────────────────────────────────────── */
  const carouselImages = useMemo(() => {
    if (!hasMedia) return [];
    return news.media.map((item) => ({
      url: getImageUrl(item.mediaUrl),
      alt: news.title,
    }));
  }, [hasMedia, news.media, news.title]);

  /* ── Render ────────────────────────────────────────────────────── */
  return (
    <div
      onClick={handleCardClick}
      className="group flex flex-col bg-white border border-border rounded-xl cursor-pointer hover:shadow-md transition-shadow duration-200 overflow-hidden"
    >
      {/* ── Image area ───────────────────────────────────────────── */}
      <div className="relative w-full rounded-t-xl overflow-hidden">
        {hasMedia ? (
          <div className="w-full h-full rounded-t-xl rounded-b-none overflow-hidden">
            <Carousel
              images={carouselImages}
              autoPlay
              interval={5000}
              className="w-full rounded-t-xl rounded-b-none aspect-video"
              objectFit="contain"
              showIndicators={false}
              lockToFirstImage={true}
            />
          </div>
        ) : (
          <div
            className="w-full h-full rounded-t-xl flex items-center justify-center p-6 min-h-[160px]"
            style={{ backgroundColor: fallbackColor }}
          >
            <span className="text-white/30 font-bold text-3xl select-none text-center leading-tight">
              {news.title?.substring(0, 20)}
            </span>
          </div>
        )}
      </div>

      {/* ── Content ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1.5 p-4 flex-1">
        <h3 className="font-bold text-base text-foreground break-words leading-snug">
          {news.title}
        </h3>
        {news.excerpt && (
          <p className="text-sm text-[#4a4a4a] line-clamp-2">{news.excerpt}</p>
        )}
        {/* Inline dot-separated metadata row */}
        <div className="flex items-center text-sm gap-1.5 text-[#606060] mt-auto pt-1">
          <span>
            {news.viewCount || 0} {newsCard?.views || "views"}
          </span>
          <span className="w-[3px] h-[3px] rounded-full bg-[#606060] inline-block" />
          <span>
            {getTranslatedTimeAgo(news.createDate, newsCard?.timeAgo)}
          </span>
        </div>
      </div>

      {/* ── Action bar ────────────────────────────────────────────── */}
      <div
        className="grid grid-cols-3 border-t border-border rounded-b-xl"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div
          className="group/reactions relative flex items-center justify-center"
          onMouseEnter={() => setShowReactions(true)}
          onMouseLeave={() => setShowReactions(false)}
        >
          <button
            onClick={(e) => {
              const type = news.currentUserReaction || "Like";
              handleReact(e, type);
            }}
            className="w-full h-12 flex items-center justify-center gap-2 transition-colors hover:bg-primaryBg rounded-bl-xl"
          >
            <ReactionIcon reaction={news.currentUserReaction} size={20} />
            <span className="text-sm text-[#606060]">
              {news.totalReactions || 0}
            </span>
          </button>

          {/* Reactions popover */}
          <ReactionsPopover
            show={showReactions}
            onClose={() => setShowReactions(false)}
            onSelect={(e, type) => handleReact(e, type)}
            iconSize={18}
          />

          {/* Touch hold for mobile reactions */}
          <div
            className="hidden"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchEnd}
            onMouseLeave={() => setShowReactions(false)}
          />
        </div>

        {/* Comments */}
        <button className="w-full h-12 flex items-center justify-center gap-2 transition-colors hover:bg-primaryBg">
          <MessageSquare
            size={20}
            strokeWidth={1.5}
            className="text-[#606060]"
          />
          <span className="text-sm text-[#606060]">
            {news.totalComments || 0}
          </span>
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          className="w-full h-12 flex items-center justify-center gap-2 transition-colors hover:bg-primaryBg rounded-br-xl"
          aria-label="Share"
        >
          <Share size={20} strokeWidth={1.5} className="text-[#606060]" />
          <span className="text-sm text-[#606060]">
            {news.totalShares || 0}
          </span>
        </button>
      </div>

      {/* ── Modals ───────────────────────────────────────────────── */}
      <div
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <ShareModal
          open={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          shareUrl={shareUrl}
        />
      </div>
    </div>
  );
};

export default NewsCard;
