import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Eye, ImageIcon, MessageSquare } from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import { getImageUrl } from "@/shared/utils/imageUtils";
import { getTranslatedTimeAgo } from "../utils/newsUtils";

const RelatedNewsCard = ({ news }) => {
  const { lang } = useParams();
  const { t, language } = useLanguage();
  const labels = t.news?.newsDetail;
  const image = news.media?.find((item) => item.mediaType === "Image" && item.mediaUrl);
  const imageUrl = image ? getImageUrl(image.mediaUrl) : null;
  const [failedImage, setFailedImage] = useState(null);
  const timeAgo = getTranslatedTimeAgo(news.createDate, t.news?.newsCard?.timeAgo);
  const comments = news.totalComments ?? news.commentCount ?? news.commentsCount;

  return (
    <Link
      to={`/${lang || language || "vi"}/cat-speak/news/${news.slug || news.postId || news.id}`}
      className="group flex w-full items-start gap-4 px-4 py-3 transition-colors hover:bg-neutral-100 dark:hover:bg-[#272727] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cath-red-700"
    >
      {/* ── Left: Thumbnail (56px height, 16:9 aspect ratio) ── */}
      <div className="h-[56px] aspect-video shrink-0 overflow-hidden rounded-lg bg-gray-200 dark:bg-[#222222] border border-gray-300/80 dark:border-[#383838]">
        {imageUrl && failedImage !== imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            onError={() => setFailedImage(imageUrl)}
            className="h-full w-full object-cover transition-transform duration-200 motion-safe:group-hover:scale-[1.03]"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center bg-gray-200 dark:bg-[#222222]"
            aria-hidden="true"
          >
            <ImageIcon
              size={20}
              className="text-gray-500 dark:text-neutral-400"
            />
          </div>
        )}
      </div>

      {/* ── Right: Content (Reordered by importance: Title → Category & Time → Stats) ── */}
      <div className="flex flex-col min-w-0 flex-1">
        {/* 1. Title */}
        <h3 className="line-clamp-2 break-words text-base text-gray-900 dark:text-white transition-colors group-hover:text-cath-red-700 dark:group-hover:text-red-400">
          {news.title}
        </h3>

        {/* 2. Time */}
        {timeAgo && (
          <div className="text-sm text-secondary dark:text-[#AAAAAA] whitespace-nowrap">
            {timeAgo}
          </div>
        )}

        {/* 3. Stats (Icon min size 20, text min text-sm, gap between icon and text gap-2) */}
        <div className="flex items-center gap-x-4 text-sm text-secondary dark:text-[#AAAAAA] mt-1">
          {news.viewCount != null && (
            <span className="inline-flex items-center gap-2 shrink-0">
              <Eye size={20} className="shrink-0" aria-hidden="true" />
              <span>{news.viewCount}</span>
            </span>
          )}
          {comments != null && (
            <span className="inline-flex items-center gap-2 shrink-0">
              <MessageSquare size={20} className="shrink-0" aria-hidden="true" />
              <span>{comments}</span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default RelatedNewsCard;
