import Carousel from "@/shared/components/ui/Carousel";
import { useLanguage } from "@/shared/context/LanguageContext";
import { getImageUrl } from "@/shared/utils/imageUtils";
import { getTranslatedTimeAgo } from "../utils/newsUtils";
import TopicChips from "./TopicChips";

const NewsArticleHeader = ({ newsItem }) => {
  const { t } = useLanguage();
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
        <TopicChips topics={newsItem.topics} color="cath-red" className="mt-4" />
      )}
    </header>
  );
};

export default NewsArticleHeader;
