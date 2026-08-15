import React, { useState, useRef, useEffect, useCallback } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { FluentAnimation } from "@/shared/components/ui/animations"
import { useLanguage } from "@/shared/context/LanguageContext"
import { VietNam, China, UK } from "@/shared/assets/icons/flags"
import useClickOutside from "@/shared/hooks/useClickOutside"

const LANGUAGES = [
  { key: "vi", label: "Tiếng Việt", flag: VietNam },
  { key: "zh", label: "中文", flag: China },
  { key: "en", label: "English", flag: UK },
];

const LanguageSwitcher = ({ className = "", align = "auto" }) => {
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [dropdownAlign, setDropdownAlign] = useState(align === "auto" ? "right" : align);
  const dropdownRef = useRef(null);

  useClickOutside(dropdownRef, () => setOpen(false));

  const updateAlignment = useCallback(() => {
    if (align !== "auto") {
      setDropdownAlign(align);
      return;
    }
    if (dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const screenWidth = window.innerWidth;
      const dropdownWidth = 220;

      // Check if expanding to the left (right-0) would overflow the viewport's left edge
      const wouldOverflowLeft = rect.right - dropdownWidth < 16;
      // Check if expanding to the right (left-0) would overflow the viewport's right edge
      const wouldOverflowRight = rect.left + dropdownWidth > screenWidth - 16;

      if (wouldOverflowLeft && !wouldOverflowRight) {
        setDropdownAlign("left");
      } else if (wouldOverflowRight && !wouldOverflowLeft) {
        setDropdownAlign("right");
      } else {
        // If center fits or if on a narrow mobile viewport
        setDropdownAlign("center");
      }
    }
  }, [align]);

  const handleToggle = () => {
    if (!open) {
      updateAlignment();
    }
    setOpen((prev) => !prev);
  };

  useEffect(() => {
    if (open) {
      updateAlignment();
      window.addEventListener("resize", updateAlignment);
      return () => window.removeEventListener("resize", updateAlignment);
    }
  }, [open, updateAlignment]);

  const handleLanguageSelect = (lang) => {
    setLanguage(lang);
    setOpen(false);
  };

  const current = LANGUAGES.find((l) => l.key === language) || LANGUAGES[0];
  const displayLabel =
    t.header?.languages?.[language] || t.header?.languages?.en || current.label;

  const alignClass =
    dropdownAlign === "left"
      ? "left-0 right-auto"
      : dropdownAlign === "center"
        ? "left-1/2 -translate-x-1/2 right-auto"
        : "right-0 left-auto";

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      ref={dropdownRef}
    >
      <motion.button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={displayLabel}
        title={displayLabel}
        onClick={handleToggle}
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-0 bg-transparent p-0 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cath-red-800/40"
      >
        <img
          src={current.flag}
          alt=""
          className="pointer-events-none block h-full w-full object-cover"
          draggable={false}
        />
      </motion.button>

      <AnimatePresence>
        {open && (
          <div
            className={`absolute top-full z-50 mt-2 min-w-[210px] w-max max-w-[calc(100vw-2rem)] ${alignClass}`}
          >
            <FluentAnimation
              direction="down"
              exit
              className="overflow-hidden rounded-2xl border border-border bg-white shadow-xl"
            >
              <div
                className="flex flex-col"
                role="listbox"
                aria-label="Language"
              >
                {LANGUAGES.map(({ key, label, flag, disabled, soonLabel }) => {
                  const isActive = language === key;

                  return (
                    <button
                      key={key}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      disabled={disabled}
                      onClick={() => !disabled && handleLanguageSelect(key)}
                      className={`relative flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors ${disabled
                        ? "cursor-not-allowed text-gray-400"
                        : isActive
                          ? "text-cath-red-800 font-medium bg-gray-50/60"
                          : "text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="lang-active-indicator"
                          className="absolute inset-0 rounded-xl bg-gray-500/5 pointer-events-none"
                        />
                      )}
                      <span className="flex h-7 w-7 shrink-0 overflow-hidden rounded-full border border-border">
                        <img
                          src={flag}
                          alt=""
                          className={`block h-full w-full object-cover ${disabled ? "grayscale opacity-50" : ""
                            }`}
                          draggable={false}
                        />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[14px]">
                        {label}
                      </span>
                      {disabled ? (
                        <span className="shrink-0 ml-auto rounded-full border border-border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-400">
                          {soonLabel || t.header?.soon || "Soon"}
                        </span>
                      ) : isActive ? (
                        <div className="ml-auto flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-[2px] border-cath-red-800">
                          <div className="h-2 w-2 rounded-full bg-cath-red-800" />
                        </div>
                      ) : (
                        <div className="ml-auto flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-[2px] border-border" />
                      )}
                    </button>
                  );
                })}
              </div>
            </FluentAnimation>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;
