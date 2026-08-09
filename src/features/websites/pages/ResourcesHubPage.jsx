import React, { useState, useMemo } from "react";
import { Compass } from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useActiveLink } from "@/features/navigation/hooks/useActiveLink";
import { websites, RESOURCE_CATEGORIES } from "../config/websitesData";
import ResourceSearchInput from "../components/ResourceSearchInput";
import ChipFilter from "@/shared/components/ChipFilter";
import EmptyState from "@/shared/components/ui/indicators/EmptyState";
import ResourceCard from "../components/ResourceCard";
import {
  TypewriterText,
  FluentAnimation,
} from "@/shared/components/ui/animations";

const ResourcesHubPage = () => {
  const { t } = useLanguage();
  const { resolvePath, currentLang } = useActiveLink();

  const [searchInput, setSearchInput] = useState("");
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const handleSearch = () => {
    setAppliedSearchQuery(searchInput);
  };

  const handleInputChange = (val) => {
    setSearchInput(val);
    if (!val.trim()) {
      setAppliedSearchQuery("");
    }
  };

  const activeLang = useMemo(() => {
    if (!currentLang) return "en";
    if (currentLang.startsWith("zh")) return "zh";
    if (currentLang.startsWith("vi")) return "vi";
    return "en";
  }, [currentLang]);

  const heroTitles = useMemo(() => {
    const baseTitle = t.websites?.hero?.title || "Resource Hub";
    if (activeLang === "zh") {
      return [baseTitle, "AI 语言工具", "互动测试模拟器", "在线词典与平台"];
    }
    if (activeLang === "vi") {
      return [
        baseTitle,
        "Công cụ học AI",
        "Giả lập đề thi",
        "Từ điển & Nền tảng",
      ];
    }
    return [
      baseTitle,
      "AI Learning Tools",
      "Exam Simulators",
      "Dictionaries & Portals",
    ];
  }, [t.websites?.hero?.title, activeLang]);

  // Flatten subItems into a single searchable list with category metadata
  const allResourceItems = useMemo(() => {
    const items = [];
    websites.forEach((group) => {
      const categoryKey = group.category || group.key;
      const groupIcon = group.icon;
      (group.subItems || []).forEach((sub) => {
        items.push({
          ...sub,
          category: categoryKey,
          groupLang: group.lang,
          icon: groupIcon,
        });
      });
    });
    return items;
  }, []);

  // Filter items based on active language, search, and category
  const filteredResources = useMemo(() => {
    return allResourceItems.filter((item) => {
      // Language filter driven by global active language
      if (activeLang && item.groupLang && item.groupLang !== activeLang) {
        return false;
      }

      // Category filter
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false;
      }

      // Search query filter
      if (appliedSearchQuery.trim()) {
        const query = appliedSearchQuery.toLowerCase();
        const matchesName = item.label?.toLowerCase().includes(query);
        const matchesDesc = item.description?.toLowerCase().includes(query);
        const matchesKey = item.key?.toLowerCase().includes(query);
        return matchesName || matchesDesc || matchesKey;
      }

      return true;
    });
  }, [allResourceItems, activeLang, selectedCategory, appliedSearchQuery]);

  // Compute category counts for active language
  const categoryCounts = useMemo(() => {
    const counts = { all: 0 };
    allResourceItems.forEach((item) => {
      if (activeLang && item.groupLang && item.groupLang !== activeLang) return;
      counts.all = (counts.all || 0) + 1;
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  }, [allResourceItems, activeLang]);

  // Compute category items for ChipFilter
  const categoryItems = useMemo(() => {
    return Object.entries(RESOURCE_CATEGORIES)
      .filter(
        ([catKey]) => catKey === "all" || (categoryCounts[catKey] || 0) > 0,
      )
      .map(([catKey, catMeta]) => ({
        key: catKey,
        label:
          t.websites?.category?.[catKey] ||
          (activeLang === "zh" ? catMeta.labelZh : catMeta.labelEn),
      }));
  }, [categoryCounts, t.websites?.category, activeLang]);

  return (
    <FluentAnimation className="min-h-screen bg-[#f3f3f3] flex flex-col p-0 sm:p-6 gap-4 sm:gap-6">
      {/* ── Dashboard Hero Banner ── */}

      <div className="relative rounded-none sm:rounded-xl bg-gradient-to-br from-[#3b0712] via-[#6b1428] to-[#2d050d] text-white py-8 px-4 sm:py-12 sm:px-8 shadow-lg shadow-rose-950/30 border-b sm:border border-rose-500/25 z-20">
        <div className="relative max-w-4xl mx-auto text-center space-y-4 sm:space-y-5">
          {/* Title */}
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white drop-shadow-sm min-h-[1.2em]">
            <TypewriterText words={heroTitles} />
          </h1>

          {/* Subtitle Description */}
          <p className="text-rose-100/90 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto drop-shadow-sm">
            {t.websites?.hero?.description ||
              "Explore curated flashcards, dictionaries, video channels, and practice tools for learning Chinese & English."}
          </p>

          {/* Search Input Bar */}
          <div className="relative max-w-xl mx-auto pt-2 z-30">
            <ResourceSearchInput
              value={searchInput}
              onChange={handleInputChange}
              onSearch={handleSearch}
              resources={allResourceItems}
              resolvePath={resolvePath}
              placeholder={
                t.websites?.search?.placeholder ||
                "Search tools, platforms, or exams (e.g. Quizlet, HSK)..."
              }
              className="w-full !bg-white/10 !backdrop-blur-sm !border-white/25 !text-white shadow-lg focus-within:!border-white/40 transition-colors duration-200"
              inputClassName="placeholder:text-rose-100/70 text-white"
              buttonClassName="group-hover:!bg-white/15 text-white"
              focusBorder={false}
            />
          </div>
        </div>
      </div>

      {/* ── Main Content Container ── */}
      <div className="relative z-10 w-full px-4 sm:px-0 flex flex-col gap-4 sm:gap-6 pb-6 sm:pb-0">
        {/* Category Filter Chips Toolbar */}
        <ChipFilter
          items={categoryItems}
          value={selectedCategory}
          onChange={setSelectedCategory}
        />

        {/* ── Resource Cards Grid ── */}
        {filteredResources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredResources.map((resource) => (
              <ResourceCard
                key={resource.key}
                item={resource}
                resolvePath={resolvePath}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            message={t.websites?.empty?.title || "No resources found"}
            icon={Compass}
            variant="detailed"
          >
            <p className="text-sm text-[#606060] mt-1 text-center max-w-sm">
              {t.websites?.empty?.description ||
                "We couldn't find any resources matching your search query or selected category filters."}
            </p>
          </EmptyState>
        )}
      </div>
    </FluentAnimation>
  );
};

export default ResourcesHubPage;
