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
    <header className="relative bg-primaryBg sm:px-6 lg:px-8">
      {images.length > 0 && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 hidden h-[70%] overflow-hidden sm:block">
          <img
            src={images[0].url}
            alt=""
            className="absolute -inset-8 h-[calc(100%+4rem)] w-[calc(100%+4rem)] max-w-none object-cover opacity-100 blur-lg"
          />
        </div>
      )}

      <div className="relative mx-auto max-w-7xl sm:pt-8 lg:pt-12">
        <div aria-hidden="true" className={`pointer-events-none absolute inset-x-0 bottom-0 hidden bg-white sm:block ${images.length > 0 ? "top-[70%]" : "top-0"}`} />
        {images.length > 0 && (
          <div className="relative mx-auto max-w-6xl">
            <Carousel
              images={images}
              className="aspect-video rounded-none bg-black/5"
              objectFit="cover"
              autoPlay={false}
            />
          </div>
        )}

        <div className={`relative mx-auto flex max-w-7xl flex-col items-center gap-4 bg-white px-4 text-center sm:px-6 ${images.length > 0 ? "pt-5 sm:pt-8 lg:pt-10" : "py-5 sm:py-8"}`}>
          <h1 id="news-article-title" className="w-full break-words text-2xl uppercase italic font-extrabold leading-tight text-gray-950 sm:text-3xl lg:text-[32px] [overflow-wrap:anywhere]">
            {newsItem.title}
          </h1>
          {newsItem.topics?.length > 0 && (
            <TopicChips topics={newsItem.topics} className="justify-center" />
          )}
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-gray-500 sm:text-sm">
            {newsItem.viewCount !== undefined && (
              <span>{newsItem.viewCount} {t.news?.newsDetail?.views || "views"}</span>
            )}
            {newsItem.viewCount !== undefined && timeAgo && <span aria-hidden="true">·</span>}
            {timeAgo && <span>{timeAgo}</span>}
          </div>
        </div>
      </div>
    </header>
  );
};

export default NewsArticleHeader;
