import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "@/shared/context/LanguageContext";
import { Eye } from "lucide-react";
import { getImageUrl } from "@/shared/utils/imageUtils";
import { getTranslatedTimeAgo } from "@/features/news/utils/newsUtils";
import Avatar from "@/shared/components/ui/Avatar";
import { COLORS } from "@/shared/constants/constants";

/**
 * RelatedNewsCard — Dedicated modern card for related news items in article details.
 */
const RelatedNewsCard = ({ news }) => {
  const navigate = useNavigate();
  const { lang } = useParams();
  const currentLang = lang || "vi";
  const { t } = useLanguage();
  const newsCard = t.news?.newsCard;

  const firstMediaUrl = useMemo(() => {
    if (news.media && news.media.length > 0) {
      return getImageUrl(news.media[0].mediaUrl);
    }
    return null;
  }, [news.media]);

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
        ? Math.abs(seed) % COLORS.length
        : seed.length % COLORS.length;
    return COLORS[index].value;
  }, [news.postId, news.title]);

  const handleCardClick = () => {
    navigate(`/${currentLang}/cat-speak/news/${news.slug || news.postId}`);
  };

  const authorName = news.authorName || news.author?.name || news.author?.fullName || "Cat Speak";
  const authorAvatar = news.authorAvatar || news.author?.avatarUrl || news.author?.avatar;

  return (
    <div
      onClick={handleCardClick}
      className="group flex flex-col bg-white border border-gray-200/80 rounded-2xl overflow-hidden cursor-pointer shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 w-full h-[330px]"
    >
      {/* Media / Thumbnail area (16:9 fixed ratio + blurred background fill) */}
      <div className="relative aspect-video w-full shrink-0 overflow-hidden border-b border-[#e5e5e5]">
        {firstMediaUrl ? (
          <>
            {/* Blurred Background Image */}
            <div
              className="absolute inset-0 z-0 bg-cover bg-center blur-2xl scale-110 opacity-60"
              style={{ backgroundImage: `url(${firstMediaUrl})` }}
            />
            {/* Main Image */}
            <img
              src={firstMediaUrl}
              alt={news.title}
              className="relative z-10 h-full w-full object-contain"
              loading="lazy"
            />
          </>
        ) : (
          <div
            className="w-full h-full flex items-center justify-center p-4 text-center"
            style={{ backgroundColor: fallbackColor }}
          >
            <span className="text-white/40 font-bold text-xl select-none leading-tight">
              {news.title?.substring(0, 15)}...
            </span>
          </div>
        )}

        {/* Category tag badge */}
        {news.category && (
          <div className="absolute top-3 left-3 z-20 bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
            {news.category}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col p-4 gap-2 flex-1 justify-between min-h-0">
        <div className="flex flex-col gap-2 min-h-0 overflow-hidden">
          <h3 className="font-bold text-base text-gray-900 group-hover:text-cath-red-700 transition-colors line-clamp-2 leading-snug">
            {news.title}
          </h3>

          {news.excerpt && (
            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
              {news.excerpt}
            </p>
          )}
        </div>

        {/* Footer Meta */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 gap-2 mt-auto shrink-0">
          {/* Author */}
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <Avatar
              src={getImageUrl(authorAvatar)}
              name={authorName}
              size={18}
              className="shrink-0 rounded-full"
            />
            <span className="truncate font-medium text-gray-700 text-xs">
              {authorName}
            </span>
          </div>

          {/* Published Time */}
          <span className="shrink-0 text-gray-400 text-[11px]">
            {getTranslatedTimeAgo(news.createDate, newsCard?.timeAgo)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RelatedNewsCard;
