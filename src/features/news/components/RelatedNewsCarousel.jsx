import { useEffect, useId, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import IconButton from "@/shared/components/ui/buttons/IconButton";
import RelatedNewsCard from "./RelatedNewsCard";

const RelatedNewsCarousel = ({ posts, heading }) => {
  const { t } = useLanguage();
  const labels = t.news?.newsDetail;
  const viewportId = useId();
  const viewportRef = useRef(null);
  const [navigation, setNavigation] = useState({ previous: false, next: false });

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const updateNavigation = () => {
      const previous = viewport.scrollLeft > 1;
      const next = viewport.scrollLeft + viewport.clientWidth < viewport.scrollWidth - 1;
      setNavigation((current) => current.previous === previous && current.next === next
        ? current
        : { previous, next });
    };

    const observer = new ResizeObserver(updateNavigation);
    observer.observe(viewport);
    viewport.addEventListener("scroll", updateNavigation, { passive: true });
    const frame = requestAnimationFrame(updateNavigation);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      viewport.removeEventListener("scroll", updateNavigation);
    };
  }, [posts.length]);

  const scroll = (direction) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    viewport.scrollBy({
      left: direction * (viewport.clientWidth + 20),
      behavior: reduceMotion ? "instant" : "smooth",
    });
  };

  return (
    <div className="min-w-0" role="group" aria-label={labels?.relatedNews || "Related news"}>
      <div className="mb-4 flex items-center justify-between gap-4">
        {heading}
        <div className="flex shrink-0 items-center gap-1">
          <IconButton
            variant="secondary"
            onClick={() => scroll(-1)}
            disabled={!navigation.previous}
            aria-label={labels?.previousPosts || "Previous posts"}
            aria-controls={viewportId}
            className="focus-visible:ring-2 focus-visible:ring-cath-red-700"
          >
            <ChevronLeft aria-hidden="true" />
          </IconButton>
          <IconButton
            variant="secondary"
            onClick={() => scroll(1)}
            disabled={!navigation.next}
            aria-label={labels?.nextPosts || "Next posts"}
            aria-controls={viewportId}
            className="focus-visible:ring-2 focus-visible:ring-cath-red-700"
          >
            <ChevronRight aria-hidden="true" />
          </IconButton>
        </div>
      </div>
      <div
        id={viewportId}
        ref={viewportRef}
        tabIndex={0}
        aria-label={labels?.relatedNews || "Related news"}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            scroll(event.key === "ArrowLeft" ? -1 : 1);
          }
        }}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto scrollbar-none overscroll-x-contain rounded-sm p-1 pb-4 focus-visible:outline-cath-red-700"
      >
        {posts.map((post) => (
          <div key={post.postId || post.id} className="min-w-0 shrink-0 basis-[85%] snap-start sm:basis-[calc((100%-1.25rem)/2)] lg:basis-[calc((100%-2.5rem)/3)]">
            <RelatedNewsCard news={post} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedNewsCarousel;
