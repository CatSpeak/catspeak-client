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
      <h1 id="news-article-title" className="break-words text-2xl font-extrabold leading-tight text-gray-950 sm:text-3xl lg:text-[32px] [overflow-wrap:anywhere]">
        {newsItem.title}
      </h1>
      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500 sm:text-sm">
        {newsItem.viewCount != null && (
          <span>{newsItem.viewCount} {t.news?.newsDetail?.views || "views"}</span>
        )}
        {newsItem.viewCount != null && timeAgo && <span aria-hidden="true">·</span>}
        {timeAgo && <span>{timeAgo}</span>}
      </div>
      {images.length > 0 && (
        <Carousel images={images} className="mt-5 aspect-video rounded-none bg-black/5 sm:mt-6" objectFit="cover" autoPlay={false} />
      )}
      {newsItem.topics?.length > 0 && <TopicChips topics={newsItem.topics} className="mt-4" />}
    </header>
  );
};

export default NewsArticleHeader;
