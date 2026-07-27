import React, { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Globe, ArrowRight } from "lucide-react";
import SearchInput from "@/shared/components/ui/inputs/SearchInput";

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

  // Compute top 5 matching websites based on search value
  const topMatches = useMemo(() => {
    const trimmed = value.trim().toLowerCase();
    if (!trimmed) return [];

    const scored = [];
    resources.forEach((item) => {
      const label = (item.label || "").toLowerCase();
      const desc = (item.description || "").toLowerCase();
      const key = (item.key || "").toLowerCase();

      let score = 0;
      if (label === trimmed) {
        score = 100;
      } else if (label.startsWith(trimmed)) {
        score = 90;
      } else if (label.includes(` ${trimmed}`) || label.includes(`-${trimmed}`)) {
        score = 80;
      } else if (label.includes(trimmed)) {
        score = 70;
      } else if (key.includes(trimmed)) {
        score = 50;
      } else if (desc.includes(trimmed)) {
        score = 30;
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
      setSelectedIndex((prev) =>
        prev < topMatches.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : topMatches.length - 1
      );
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
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#2d050d]/95 backdrop-blur-xl border border-rose-500/30 rounded-2xl shadow-2xl overflow-hidden p-1.5 transition-all duration-200 animate-in fade-in slide-in-from-top-2">
          <div className="text-[11px] font-semibold text-rose-200/60 uppercase tracking-wider px-3 py-1.5">
            Suggested Resources ({topMatches.length})
          </div>
          <div className="space-y-1">
            {topMatches.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const IconComp = item.icon || Globe;
              const brandColor = item.color || "#e11d48";

              return (
                <div
                  key={item.key || idx}
                  onClick={() => handleSelectOption(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors duration-150 ${
                    isSelected
                      ? "bg-rose-500/25 text-white shadow-sm border border-rose-400/30"
                      : "text-rose-100/90 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-lg bg-white/95 border border-white/40 flex items-center justify-center shrink-0 p-1.5 shadow-sm"
                      style={{
                        boxShadow: `0 2px 8px ${brandColor}30`,
                      }}
                    >
                      {item.img ? (
                        <img
                          src={item.img}
                          alt={item.label}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            if (e.currentTarget.nextSibling) {
                              e.currentTarget.nextSibling.style.display = "block";
                            }
                          }}
                        />
                      ) : null}
                      <IconComp
                        size={18}
                        style={{
                          color: brandColor,
                          display: item.img ? "none" : "block",
                        }}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold truncate text-white">
                        {item.label}
                      </div>
                      {item.description && (
                        <div className="text-xs text-rose-200/70 truncate max-w-md">
                          {item.description}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center pl-2">
                    <ArrowRight
                      size={16}
                      className={`transition-transform duration-150 ${
                        isSelected
                          ? "text-rose-300 translate-x-0.5 opacity-100"
                          : "text-rose-300/40 opacity-0 group-hover:opacity-100"
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
