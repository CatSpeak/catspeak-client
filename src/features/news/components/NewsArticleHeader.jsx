import { useNavigate, useParams } from "react-router-dom";
import Carousel from "@/shared/components/ui/Carousel";
import { useLanguage } from "@/shared/context/LanguageContext";
import { getImageUrl } from "@/shared/utils/imageUtils";
import Badge from "@/shared/components/ui/indicators/Badge";
import { getTranslatedTimeAgo } from "../utils/newsUtils";

const NewsArticleHeader = ({ newsItem }) => {
  const navigate = useNavigate();
  const { lang: paramLang } = useParams();
  const { language, t } = useLanguage();
  const currentLang = paramLang || language || "vi";

  const handleTopicClick = (e, topic) => {
    e.preventDefault();
    e.stopPropagation();
    const topicId = topic.topicId ?? topic.TopicId ?? topic.id;
    if (topicId !== undefined && topicId !== null) {
      navigate(`/${currentLang}/cat-speak/news?topicIds=${topicId}`);
    }
  };

  const images = (newsItem.media || [])
    .filter((item) => item.mediaType === "Image" && item.mediaUrl)
    .map((item) => ({ url: getImageUrl(item.mediaUrl), alt: newsItem.title }));
  const timeAgo = getTranslatedTimeAgo(newsItem.createDate, t.news?.newsCard?.timeAgo);

  return (
    <header className="min-w-0 text-left">
      <h1 id="news-article-title" className="break-words text-3xl font-bold tracking-tight text-gray-950 dark:text-white [overflow-wrap:anywhere]">
        {newsItem.title}
      </h1>
      <div className="mt-2 flex items-center flex-wrap gap-x-2 text-sm text-secondary dark:text-[#AAAAAA]">
        {timeAgo && (
          <span className="whitespace-nowrap">{timeAgo}</span>
        )}
        {timeAgo && newsItem.viewCount != null && (
          <span className="w-1 h-1 rounded-full bg-secondary dark:bg-[#AAAAAA] shrink-0" />
        )}
        {newsItem.viewCount != null && (
          <span className="whitespace-nowrap">
            {newsItem.viewCount} {t.news?.newsDetail?.views || "views"}
          </span>
        )}
      </div>
      {images.length > 0 && (
        <Carousel images={images} className="mt-4 aspect-video rounded-2xl bg-black/5" objectFit="cover" autoPlay={false} />
      )}
      {newsItem.topics?.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {newsItem.topics.map((topic, index) => {
            const id = topic.topicId ?? topic.TopicId ?? topic.id ?? index;
            const title = topic.title || topic.Title || topic.slug || "";
            if (!title) return null;

            return (
              <Badge
                key={id}
                role="button"
                tabIndex={0}
                onClick={(e) => handleTopicClick(e, topic)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleTopicClick(e, topic);
                  }
                }}
                className="!cursor-pointer transition-opacity hover:opacity-80 select-none"
                title={`#${title}`}
              >
                #{title}
              </Badge>
            );
          })}
        </div>
      )}
    </header>
  );
};

export default NewsArticleHeader;
