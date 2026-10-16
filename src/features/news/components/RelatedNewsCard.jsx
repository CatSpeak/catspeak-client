import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Eye, ImageIcon, MessageSquare, Share, ThumbsUp } from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import { getImageUrl } from "@/shared/utils/imageUtils";
import { getTranslatedTimeAgo } from "../utils/newsUtils";

const RelatedNewsCard = ({ news }) => {
  const { lang } = useParams();
  const { t, language } = useLanguage();
  const labels = t.news?.newsDetail;
  const image = news.media?.find((item) => item.mediaType === "Image");
  const imageUrl = image ? getImageUrl(image.mediaUrl) : null;
  const [failedImage, setFailedImage] = useState(null);
  const timeAgo = getTranslatedTimeAgo(news.createDate, t.news?.newsCard?.timeAgo);
  const stats = [
    { icon: ThumbsUp, count: news.totalReactions ?? news.reactionCount ?? 0, label: labels?.reactions || "Reactions" },
    { icon: Share, count: news.totalShares ?? news.shareCount ?? 0, label: labels?.share || "Share" },
    { icon: MessageSquare, count: news.totalComments ?? news.commentCount ?? 0, label: labels?.comment || "Comment" },
  ];

  return (
    <Link
      to={`/${lang || language || "vi"}/cat-speak/news/${news.slug || news.postId || news.id}`}
      className="group flex min-w-0 flex-col gap-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cath-red-700 focus-visible:ring-offset-4"
    >
      <div className="aspect-video w-full overflow-hidden rounded-lg bg-[#eeedf9]">
        {imageUrl && failedImage !== imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setFailedImage(imageUrl)}
            className="h-full w-full object-cover transition-transform duration-200 motion-safe:group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center" aria-hidden="true">
            <ImageIcon className="h-10 w-10 text-[#cbcce2]" strokeWidth={1.5} />
          </div>
        )}
      </div>
      <h3 className="line-clamp-2 break-words text-sm font-semibold leading-snug text-gray-900 transition-colors group-hover:text-cath-red-700">
        {news.title}
      </h3>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs leading-5 text-gray-500">
        <span className="inline-flex items-center gap-1">
          <Eye size={13} aria-hidden="true" />
          {news.viewCount ?? 0} {t.news?.newsCard?.views || "views"}
        </span>
        {timeAgo && <span>{timeAgo}</span>}
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
        {stats.map((stat) => (
          <span key={stat.label} className="inline-flex items-center gap-1" aria-label={`${stat.label}: ${stat.count}`}>
            <stat.icon size={14} strokeWidth={1.5} aria-hidden="true" />
            {stat.count}
          </span>
        ))}
      </div>
    </Link>
  );
};

export default RelatedNewsCard;
