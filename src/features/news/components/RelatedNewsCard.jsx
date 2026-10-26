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
  const category = Number(news.postType) === 2
    ? t.news?.globalNews || "Global news"
    : t.news?.catSpeakNews || "CatSpeak news";
  const comments = news.totalComments ?? news.commentCount ?? news.commentsCount;

  return (
    <Link
      to={`/${lang || language || "vi"}/cat-speak/news/${news.slug || news.postId || news.id}`}
      className="group grid min-w-0 grid-cols-[minmax(0,1fr)_80px] gap-x-3 gap-y-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cath-red-700 focus-visible:ring-offset-4"
    >
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] leading-4 text-gray-500">
          <span className="font-semibold text-gray-600">{category}</span>
          {timeAgo && <><span aria-hidden="true">·</span><span>{timeAgo}</span></>}
        </div>
        <h3 className="line-clamp-3 break-words text-sm font-semibold leading-snug text-gray-900 transition-colors group-hover:text-cath-red-700">
          {news.title}
        </h3>
      </div>
      <div className="h-20 w-20 overflow-hidden rounded-lg bg-primary2">
        {imageUrl && failedImage !== imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            width={80}
            height={80}
            onError={() => setFailedImage(imageUrl)}
            className="h-full w-full object-cover transition-transform duration-200 motion-safe:group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center" aria-hidden="true">
            <ImageIcon className="h-10 w-10 text-[#cbcce2]" strokeWidth={1.5} />
          </div>
        )}
      </div>
      <div className="col-span-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs leading-5 text-gray-500">
        {news.viewCount != null && (
          <span className="inline-flex items-center gap-1">
            <Eye size={13} aria-hidden="true" />
            {news.viewCount} {t.news?.newsCard?.views || "views"}
          </span>
        )}
        {comments != null && (
          <span className="inline-flex items-center gap-1">
            <MessageSquare size={13} aria-hidden="true" />
            {comments} {labels?.comment || "Comments"}
          </span>
        )}
      </div>
    </Link>
  );
};

export default RelatedNewsCard;
