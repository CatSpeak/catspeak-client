import React, { useState, useRef, useEffect, useLayoutEffect, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { useParams } from "react-router-dom";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useGetTopicsQuery } from "@/store/api/social/postsApi";
import { getCommunityName, getCommunityLanguageId } from "../utils/newsUtils";
import ChipFilter from "@/shared/components/ChipFilter";


const TopicFilter = ({
  selectedTopicIds = [],
  onTopicChange,
  onPendingChange,
  languageCommunity: propLanguageCommunity,
  className = "",
}) => {
  const { lang } = useParams();
  const { t, language } = useLanguage();

  const currentCommunity = useMemo(() => {
    return getCommunityName(
      lang || localStorage.getItem("communityLanguage") || language || "en",
    );
  }, [lang, language]);

  const resolvedLanguageCommunity = useMemo(() => {
    if (propLanguageCommunity !== undefined && propLanguageCommunity !== null) {
      return typeof propLanguageCommunity === "number"
        ? propLanguageCommunity
        : getCommunityLanguageId(propLanguageCommunity);
    }
    return getCommunityLanguageId(lang || currentCommunity);
  }, [propLanguageCommunity, lang, currentCommunity]);

  // 1. Fetch topics for current community language
  const { data: topicsData, isLoading } = useGetTopicsQuery({
    languageCommunity: resolvedLanguageCommunity,
    page: 1,
    pageSize: 100,
  });

  const topics = useMemo(() => {
    const raw = topicsData?.data ?? topicsData ?? [];
    const list = Array.isArray(raw) ? raw : [];
    if (resolvedLanguageCommunity === undefined || resolvedLanguageCommunity === null) {
      return list;
    }
    return list.filter((topic) => {
      const topicLang = topic.languageCommunity ?? topic.LanguageCommunity;
      return (
        topicLang === undefined ||
        topicLang === 0 ||
        topicLang === resolvedLanguageCommunity
      );
    });
  }, [topicsData, resolvedLanguageCommunity]);

  // 2. Local selection state for instant snappy UI feedback
  const selectedKey = useMemo(
    () => (selectedTopicIds || []).slice().sort().join(","),
    [selectedTopicIds],
  );

  const [localSelectedIds, setLocalSelectedIds] = useState(selectedTopicIds);
  const [prevSelectedKey, setPrevSelectedKey] = useState(selectedKey);

  // Sync from parent props when URL changes externally (storing information from previous renders)
  if (selectedKey !== prevSelectedKey) {
    setPrevSelectedKey(selectedKey);
    setLocalSelectedIds(selectedTopicIds);
  }

  const debounceTimer = useRef(null);

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // 3. Dropdown state & click outside
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const containerRef = useRef(null);
  const measureContainerRef = useRef(null);
  const labelRef = useRef(null);

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

    const gap = 8; // gap-2 = 8px
    const labelWidth = labelRef.current ? labelRef.current.offsetWidth + gap : 0;
    const availableWidth = Math.max(0, containerWidth - labelWidth);

    const measureChips = measureContainerRef.current.children;
    if (!measureChips || measureChips.length === 0) return;

    const moreBtnWidth = 110; // approximate width of "Xem thêm" chip with chevron

    let currentTotalWidth = 0;
    let count = 0;

    for (let i = 0; i < measureChips.length; i++) {
      const chipWidth = measureChips[i].offsetWidth;
      const widthIfAdded = currentTotalWidth + (i > 0 ? gap : 0) + chipWidth;

      // If it's the last item and all items fit:
      if (i === measureChips.length - 1 && widthIfAdded <= availableWidth) {
        count = measureChips.length;
        break;
      }

      // If adding this chip exceeds container width minus more button:
      if (widthIfAdded + gap + moreBtnWidth > availableWidth) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topics]);

  // 5. Toggle topic selection with short debounce
  const handleToggleTopic = (topicId) => {
    const isSelected = localSelectedIds.includes(topicId);
    const updated = isSelected
      ? localSelectedIds.filter((id) => id !== topicId)
      : [...localSelectedIds, topicId];

    setLocalSelectedIds(updated);

    if (onPendingChange) {
      onPendingChange(true);
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      if (onTopicChange) {
        onTopicChange(updated);
      }
      if (onPendingChange) {
        onPendingChange(false);
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
        <div className="h-4 w-14 rounded bg-gray-200 dark:bg-[#272727] animate-pulse shrink-0 mr-1" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-8 w-20 rounded-full bg-gray-200 dark:bg-[#272727] animate-pulse shrink-0"
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
              className="inline-flex items-center h-8 px-4 rounded-lg text-sm font-medium border whitespace-nowrap"
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
        <span
          ref={labelRef}
          className="text-sm font-semibold text-slate-700 dark:text-neutral-300 select-none shrink-0 flex items-center gap-1.5 mr-1"
        >
          {t.news?.filters?.topics || "Chủ đề"}:
        </span>

        <ChipFilter
          items={visibleTopics.map((topic) => {
            const id = topic.topicId ?? topic.TopicId ?? topic.id;
            const title = topic.title || topic.Title || topic.slug || "";
            return { key: id, label: `#${title}` };
          })}
          value={localSelectedIds}
          onChange={handleToggleTopic}
          className="flex items-center gap-2 flex-nowrap shrink-0"
        />

        {/* ── "Xem thêm" / See more Dropdown Chip ── */}
        {hiddenTopics.length > 0 && (
          <div ref={dropdownRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className={`h-8 inline-flex items-center gap-1.5 px-3 rounded-lg text-sm font-medium transition-colors shadow-none select-none cursor-pointer whitespace-nowrap ${
                hiddenSelectedCount > 0
                  ? "bg-primary text-white border border-primary hover:bg-primary/90 dark:bg-primary dark:text-white dark:border-primary"
                  : "bg-white dark:bg-[#1A1A1A] text-slate-700 dark:text-neutral-200 border border-slate-200 dark:border-[#3F3F3F] hover:bg-slate-50 dark:hover:bg-[#272727] hover:border-slate-300 dark:hover:border-[#555]"
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
              <div className="absolute left-0 sm:right-0 sm:left-auto top-full mt-2 w-72 sm:w-80 max-h-64 overflow-y-auto bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#3F3F3F] rounded-2xl p-3 shadow-xl z-50 flex flex-wrap gap-2 animate-enter">
                {hiddenTopics.map((topic) => {
                  const id = topic.topicId ?? topic.TopicId ?? topic.id;
                  const title = topic.title || topic.Title || topic.slug || "";
                  const isSelected = localSelectedIds.includes(id);

                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleToggleTopic(id)}
                      className={`h-7 inline-flex items-center px-2.5 rounded-lg text-xs font-medium transition-colors shadow-none select-none cursor-pointer whitespace-nowrap ${
                        isSelected
                          ? "bg-primary text-white border border-primary hover:bg-primary/90 dark:bg-primary dark:text-white dark:border-primary"
                          : "bg-white dark:bg-[#1A1A1A] text-slate-700 dark:text-neutral-200 border border-slate-200 dark:border-[#3F3F3F] hover:bg-slate-50 dark:hover:bg-[#272727] hover:border-slate-300 dark:hover:border-[#555]"
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
