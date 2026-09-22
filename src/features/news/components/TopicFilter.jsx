import React, { useState, useRef, useEffect, useLayoutEffect, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useGetTopicsQuery } from "@/store/api/social/postsApi";

/**
 * TopicFilter — Interactive topic selection bar for NewsPage.
 *
 * Rules:
 * - Fetches topics using `getTopics` API query.
 * - Renders chips in a single row without wrapping.
 * - Displays a "Xem thêm" (See more) dropdown chip for overflow topics.
 * - Multi-select supported.
 * - Short debounce (~250ms) before committing selection to `onTopicChange`.
 * - Chip styling:
 *   - Unselected: White background, gray border, no shadow (`bg-white border-slate-200 text-slate-700 shadow-none`).
 *   - Selected: Primary background, white text, primary border (`bg-primary text-white border-primary shadow-none`).
 */
const TopicFilter = ({
  selectedTopicIds = [],
  onTopicChange,
  className = "",
}) => {
  const { t } = useLanguage();

  // 1. Fetch topics
  const { data: topicsData, isLoading } = useGetTopicsQuery({
    page: 1,
    pageSize: 100,
  });

  const topics = useMemo(() => {
    const raw = topicsData?.data ?? topicsData ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [topicsData]);

  // 2. Local selection state for instant snappy UI feedback
  const [localSelectedIds, setLocalSelectedIds] = useState(selectedTopicIds);
  const debounceTimer = useRef(null);

  // Sync from parent props when URL changes externally
  useEffect(() => {
    setLocalSelectedIds(selectedTopicIds);
  }, [selectedTopicIds]);

  // 3. Dropdown state & click outside
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const containerRef = useRef(null);
  const measureContainerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // 4. Calculate how many chips fit in 1 single row
  const [visibleCount, setVisibleCount] = useState(topics.length);

  const calculateFit = () => {
    if (!containerRef.current || !measureContainerRef.current || topics.length === 0) {
      return;
    }

    const containerWidth = containerRef.current.offsetWidth;
    if (containerWidth <= 0) return;

    const measureChips = measureContainerRef.current.children;
    if (!measureChips || measureChips.length === 0) return;

    const gap = 8; // gap-2 = 8px
    const moreBtnWidth = 110; // approximate width of "Xem thêm" chip with chevron

    let currentTotalWidth = 0;
    let count = 0;

    for (let i = 0; i < measureChips.length; i++) {
      const chipWidth = measureChips[i].offsetWidth;
      const widthIfAdded = currentTotalWidth + (i > 0 ? gap : 0) + chipWidth;

      // If it's the last item and all items fit:
      if (i === measureChips.length - 1 && widthIfAdded <= containerWidth) {
        count = measureChips.length;
        break;
      }

      // If adding this chip exceeds container width minus more button:
      if (widthIfAdded + gap + moreBtnWidth > containerWidth) {
        break;
      }

      currentTotalWidth = widthIfAdded;
      count++;
    }

    setVisibleCount(Math.max(1, count));
  };

  useLayoutEffect(() => {
    calculateFit();

    if (!containerRef.current) return;
    const observer = new ResizeObserver(() => {
      calculateFit();
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [topics]);

  // 5. Toggle topic selection with short debounce
  const handleToggleTopic = (topicId) => {
    const isSelected = localSelectedIds.includes(topicId);
    const updated = isSelected
      ? localSelectedIds.filter((id) => id !== topicId)
      : [...localSelectedIds, topicId];

    setLocalSelectedIds(updated);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      if (onTopicChange) {
        onTopicChange(updated);
      }
    }, 250);
  };

  const visibleTopics = useMemo(() => {
    return topics.slice(0, visibleCount);
  }, [topics, visibleCount]);

  const hiddenTopics = useMemo(() => {
    return topics.slice(visibleCount);
  }, [topics, visibleCount]);

  const hiddenSelectedCount = useMemo(() => {
    return hiddenTopics.filter((t) => {
      const id = t.topicId ?? t.TopicId ?? t.id;
      return localSelectedIds.includes(id);
    }).length;
  }, [hiddenTopics, localSelectedIds]);

  if (isLoading && topics.length === 0) {
    return (
      <div className={`flex items-center gap-2 overflow-hidden py-1 ${className}`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-8 w-20 rounded-full bg-gray-200 animate-pulse shrink-0"
          />
        ))}
      </div>
    );
  }

  if (topics.length === 0) {
    return null;
  }

  return (
    <div className={`relative w-full ${className}`}>
      {/* ── Hidden measurement container for accurate single-row calculation ── */}
      <div
        ref={measureContainerRef}
        aria-hidden="true"
        className="absolute top-0 left-0 flex items-center gap-2 pointer-events-none opacity-0 -z-50 whitespace-nowrap"
        style={{ visibility: "hidden" }}
      >
        {topics.map((topic, idx) => {
          const title = topic.title || topic.Title || topic.slug || "";
          return (
            <span
              key={idx}
              className="inline-flex items-center px-3.5 py-1.5 rounded-full text-sm font-medium border whitespace-nowrap"
            >
              #{title}
            </span>
          );
        })}
      </div>

      {/* ── Visible single-row container ── */}
      <div
        ref={containerRef}
        className="flex items-center gap-2 w-full overflow-visible flex-nowrap"
      >
        {visibleTopics.map((topic) => {
          const id = topic.topicId ?? topic.TopicId ?? topic.id;
          const title = topic.title || topic.Title || topic.slug || "";
          const isSelected = localSelectedIds.includes(id);

          return (
            <button
              key={id}
              type="button"
              onClick={() => handleToggleTopic(id)}
              className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors shadow-none select-none cursor-pointer whitespace-nowrap shrink-0 ${
                isSelected
                  ? "bg-primary text-white border border-primary hover:bg-primary/90"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              #{title}
            </button>
          );
        })}

        {/* ── "Xem thêm" / See more Dropdown Chip ── */}
        {hiddenTopics.length > 0 && (
          <div ref={dropdownRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors shadow-none select-none cursor-pointer whitespace-nowrap ${
                hiddenSelectedCount > 0
                  ? "bg-primary text-white border border-primary hover:bg-primary/90"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300"
              }`}
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
            >
              <span>
                {t.news?.filters?.seeMore || "Xem thêm"}
                {hiddenSelectedCount > 0 ? ` (${hiddenSelectedCount})` : ""}
              </span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* ── Popover dropdown menu ── */}
            {isDropdownOpen && (
              <div className="absolute left-0 sm:right-0 sm:left-auto top-full mt-2 w-72 sm:w-80 max-h-64 overflow-y-auto bg-white border border-slate-200 rounded-2xl p-3 shadow-xl z-50 flex flex-wrap gap-2 animate-enter">
                {hiddenTopics.map((topic) => {
                  const id = topic.topicId ?? topic.TopicId ?? topic.id;
                  const title = topic.title || topic.Title || topic.slug || "";
                  const isSelected = localSelectedIds.includes(id);

                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleToggleTopic(id)}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors shadow-none select-none cursor-pointer whitespace-nowrap ${
                        isSelected
                          ? "bg-primary text-white border border-primary hover:bg-primary/90"
                          : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                      }`}
                    >
                      #{title}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicFilter;
