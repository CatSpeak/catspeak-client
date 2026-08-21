import React, { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Globe, ArrowRight } from "lucide-react";
import SearchInput from "@/shared/components/ui/inputs/SearchInput";

// Helper function to strip diacritics / accents and convert to lowercase for Unicode-insensitive matching
const normalizeText = (str) => {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase();
};

const ResourceSearchInput = ({
  value,
  onChange,
  onSearch,
  resources = [],
  resolvePath,
  placeholder = "Search...",
  className = "",
  inputClassName = "",
  buttonClassName = "",
  focusBorder = false,
}) => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);

  // Compute top 5 matching websites based on search value (case & Unicode insensitive)
  const topMatches = useMemo(() => {
    const rawTrimmed = value.trim();
    if (!rawTrimmed) return [];

    const normQuery = normalizeText(rawTrimmed);
    if (!normQuery) return [];

    const queryWords = normQuery.split(/\s+/).filter(Boolean);
    const scored = [];

    resources.forEach((item) => {
      const normLabel = normalizeText(item.label);
      const normDesc = normalizeText(item.description);
      const normKey = normalizeText(item.key);

      let score = 0;
      if (normLabel === normQuery) {
        score = 100;
      } else if (normLabel.startsWith(normQuery)) {
        score = 90;
      } else if (
        normLabel.includes(` ${normQuery}`) ||
        normLabel.includes(`-${normQuery}`)
      ) {
        score = 80;
      } else if (normLabel.includes(normQuery)) {
        score = 70;
      } else if (
        queryWords.length > 1 &&
        queryWords.every((w) => normLabel.includes(w))
      ) {
        score = 65;
      } else if (normKey.includes(normQuery)) {
        score = 50;
      } else if (normDesc.includes(normQuery)) {
        score = 30;
      } else if (
        queryWords.length > 1 &&
        queryWords.every((w) => normDesc.includes(w))
      ) {
        score = 25;
      }

      if (score > 0) {
        scored.push({ item, score });
      }
    });

    // Sort by highest score, then shorter label
    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.item.label.length - b.item.label.length;
    });

    return scored.slice(0, 5).map((s) => s.item);
  }, [value, resources]);

  // Reset selected index when topMatches change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [topMatches]);

  // Show dropdown when focused and matches exist
  const showDropdown = isOpen && isFocused && topMatches.length > 0;

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectOption = (item) => {
    setIsOpen(false);
    if (onChange) {
      onChange(item.label);
    }
    if (onSearch) {
      onSearch(item.label);
    }
    if (item.path) {
      const targetUrl = resolvePath ? resolvePath(item.path) : item.path;
      if (targetUrl.startsWith("http")) {
        window.open(targetUrl, "_blank", "noopener,noreferrer");
      } else {
        navigate(targetUrl);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (!showDropdown) {
      if (e.key === "ArrowDown" && topMatches.length > 0) {
        e.preventDefault();
        setIsOpen(true);
        setSelectedIndex(0);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < topMatches.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : topMatches.length - 1));
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0 && topMatches[selectedIndex]) {
        e.preventDefault();
        handleSelectOption(topMatches[selectedIndex]);
      } else {
        setIsOpen(false);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  const handleInputChange = (val) => {
    if (onChange) onChange(val);
    setIsOpen(true);
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (value.trim()) {
      setIsOpen(true);
    }
  };

  const handleBlur = () => {
    // Delay blur state cleanup slightly to allow item clicks
    setTimeout(() => {
      setIsFocused(false);
    }, 150);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <SearchInput
        value={value}
        onChange={handleInputChange}
        onSearch={() => {
          setIsOpen(false);
          if (onSearch) onSearch();
        }}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={className}
        inputClassName={inputClassName}
        buttonClassName={buttonClassName}
        focusBorder={focusBorder}
      />

      {/* Autocomplete Dropdown Menu */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white border border-border rounded-2xl shadow-xl overflow-hidden p-1.5 transition-all duration-200 animate-in fade-in slide-in-from-top-2 text-slate-800">
          <div className="space-y-1">
            {topMatches.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const IconComp = item.icon || Globe;
              const brandColor = item.color || "#475569";

              return (
                <div
                  key={item.key || idx}
                  onClick={() => handleSelectOption(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors duration-150 ${
                    isSelected
                      ? "bg-slate-100 text-slate-900 border border-border shadow-xs"
                      : "text-slate-700 hover:bg-slate-50 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {item.label}
                  </div>

                  <div className="shrink-0 flex items-center pl-2">
                    <ArrowRight
                      size={16}
                      className={`transition-transform duration-150 ${
                        isSelected
                          ? "text-slate-700 translate-x-0.5 opacity-100"
                          : "text-slate-300 opacity-0 group-hover:opacity-100"
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceSearchInput;
