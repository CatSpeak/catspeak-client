import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ExternalLink,
  Globe,
  Compass,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
} from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useActiveLink } from "@/features/navigation/hooks/useActiveLink";
import { websites, RESOURCE_CATEGORIES } from "../config/websitesData";
import { websiteApi } from "../api/websiteApi";

const ResourcesHubPage = () => {
  const { t } = useLanguage();
  const { resolvePath, currentLang } = useActiveLink();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLang, setSelectedLang] = useState(currentLang || "all");

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

  // Filter items based on language, search, and category
  const filteredResources = useMemo(() => {
    return allResourceItems.filter((item) => {
      // Language filter
      if (selectedLang !== "all" && item.groupLang !== selectedLang) {
        return false;
      }

      // Category filter
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.label?.toLowerCase().includes(query);
        const matchesDesc = item.description?.toLowerCase().includes(query);
        const matchesKey = item.key?.toLowerCase().includes(query);
        return matchesName || matchesDesc || matchesKey;
      }

      return true;
    });
  }, [allResourceItems, selectedLang, selectedCategory, searchQuery]);

  // Compute category counts for active language
  const categoryCounts = useMemo(() => {
    const counts = { all: 0 };
    allResourceItems.forEach((item) => {
      if (selectedLang !== "all" && item.groupLang !== selectedLang) return;
      counts.all = (counts.all || 0) + 1;
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  }, [allResourceItems, selectedLang]);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      {/* ── Top Hero Banner ── */}
      <div className="relative overflow-hidden bg-slate-900 border-b border-slate-800 text-white py-10 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-xs font-semibold uppercase tracking-wider text-rose-300">
              <Sparkles size={14} className="text-amber-400" />
              Learning Directory
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Resource Hub
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Explore 30+ curated interactive practice portals, AI tools, test simulators, and dictionaries to accelerate your language journey.
            </p>
          </div>

          {/* Language Switcher Pills */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 p-1.5 rounded-xl backdrop-blur-md shrink-0 self-start md:self-auto border border-slate-700/60">
            <button
              onClick={() => setSelectedLang("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedLang === "all"
                  ? "bg-rose-600 text-white shadow-sm font-semibold"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              All Languages
            </button>
            <button
              onClick={() => setSelectedLang("en")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                selectedLang === "en"
                  ? "bg-rose-600 text-white shadow-sm font-semibold"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              🇬🇧 English
            </button>
            <button
              onClick={() => setSelectedLang("zh")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                selectedLang === "zh"
                  ? "bg-rose-600 text-white shadow-sm font-semibold"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              🇨🇳 中文 (Chinese)
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Content Container ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/80 p-4 sm:p-5 mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools, platforms, dictionaries, or exams (e.g. Quizlet, YouGlish, HSK, EF SET)..."
              className="w-full pl-12 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white transition-all text-sm sm:text-base"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 px-2 py-1 rounded-md"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-1">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
              <Filter size={12} /> Category:
            </span>
            {Object.entries(RESOURCE_CATEGORIES).map(([catKey, catMeta]) => {
              const count = categoryCounts[catKey] || 0;
              const isSelected = selectedCategory === catKey;
              if (catKey !== "all" && count === 0) return null;

              return (
                <button
                  key={catKey}
                  onClick={() => setSelectedCategory(catKey)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-slate-900 text-white shadow-md ring-2 ring-slate-900/10"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                  }`}
                >
                  <span>{selectedLang === "zh" ? catMeta.labelZh : catMeta.labelEn}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                      isSelected ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Counter Header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm font-medium text-slate-500">
            Showing <span className="font-bold text-slate-800">{filteredResources.length}</span> learning resources
          </p>
          {(searchQuery || selectedCategory !== "all" || selectedLang !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSelectedLang("all");
              }}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 hover:underline"
            >
              Reset all filters
            </button>
          )}
        </div>

        {/* ── Resource Cards Grid ── */}
        {filteredResources.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredResources.map((resource) => (
              <ResourceCard key={resource.key} item={resource} resolvePath={resolvePath} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
              <Compass size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No resources found</h3>
            <p className="text-sm text-slate-500">
              We couldn't find any resources matching your search query or selected category filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSelectedLang("all");
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white font-medium text-xs hover:bg-slate-800 transition-colors shadow-sm"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Resource Card Component ──
const ResourceCard = ({ item, resolvePath }) => {
  const [imgError, setImgError] = useState(false);
  const IconComponent = item.icon || Globe;
  const categoryMeta = RESOURCE_CATEGORIES[item.category] || {};

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Top Color Accent Line */}
      <div
        className="h-1 w-full shrink-0"
        style={{ backgroundColor: item.color || "#64748b" }}
      />

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Header row: Icon/Favicon + Category badge */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 p-2 group-hover:scale-105 transition-transform">
              {item.img && !imgError ? (
                <img
                  src={item.img}
                  alt={item.label}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-contain"
                />
              ) : (
                <IconComponent
                  size={22}
                  style={{ color: item.color || "#64748b" }}
                />
              )}
            </div>

            <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600 group-hover:bg-slate-200 group-hover:text-slate-900 transition-colors">
              {categoryMeta.labelEn || item.category}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-slate-800 group-hover:text-slate-900 transition-colors line-clamp-1">
            {item.label}
          </h3>

          {/* Description */}
          <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
            {item.description || "Interactive resource for language learners to practice skills."}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
          <Link
            to={resolvePath(item.path)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 text-white font-medium text-xs hover:bg-rose-600 group-hover:bg-rose-600 transition-all shadow-sm"
          >
            <span>Open Tool</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResourcesHubPage;
