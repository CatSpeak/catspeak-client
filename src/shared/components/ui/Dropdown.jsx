import React, { useState, useRef, useEffect, useMemo } from "react"
import { createPortal } from "react-dom"
import { ChevronDown, Search } from "lucide-react"
import { AnimatePresence } from "framer-motion"
import FluentAnimation from "@/shared/components/ui/animations/FluentAnimation"
import useClickOutside from "@/shared/hooks/useClickOutside"
import colors from "@/shared/utils/colors"
import { useLanguage } from "@/shared/context/LanguageContext"
import MenuItem from "@/shared/components/ui/MenuItem"
import PillButton from "@/shared/components/ui/buttons/PillButton"

const removeDiacritics = (str) => {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
};

const Dropdown = ({
  options = [],
  value,
  onChange,
  trigger,
  renderOption,
  placeholder = "Select...",
  className = "",
  dropdownClassName = "min-w-[260px] max-w-[260px]",
  triggerClassName = "",
  align = "left", // 'left' | 'right' | 'center'
  maxHeightClass = "max-h-[250px]",
  activeColor = colors.primaryRed,
  disabled = false,
  enableSearch = false,
  searchPlaceholder = "Search...",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useLanguage();
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const [portalCoords, setPortalCoords] = useState(null);
  const portalRef = useRef(null);

  useClickOutside(dropdownRef, (e) => {
    if (portalRef.current && portalRef.current.contains(e.target)) {
      return;
    }
    setIsOpen(false);
  });

  useEffect(() => {
    if (isOpen && enableSearch) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setSearchQuery("");
    }
  }, [isOpen, enableSearch]);

  useEffect(() => {
    const handleClose = () => setIsOpen(false);

    const updateCoords = () => {
      if (isOpen && dropdownRef.current) {
        const rect = dropdownRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        // Flip up if there's less than ~300px below and more space above
        const flipUp = spaceBelow < 300 && spaceAbove > spaceBelow;

        // Check horizontal clipping (assume ~260px width default)
        const forceAlignRight = rect.left + 260 > window.innerWidth;

        setPortalCoords((prev) => {
          const newTop = rect.top + window.scrollY
          const newLeft = rect.left + window.scrollX

          if (
            prev &&
            prev.top === newTop &&
            prev.left === newLeft &&
            prev.width === rect.width &&
            prev.height === rect.height &&
            prev.flipUp === flipUp &&
            prev.forceAlignRight === forceAlignRight
          ) {
            return prev;
          }

          return {
            top: newTop,
            left: newLeft,
            width: rect.width,
            height: rect.height,
            flipUp,
            forceAlignRight,
          };
        });
      }
    };

    const handleScroll = (e) => {
      // Don't close if scrolling inside the dropdown portal itself
      if (portalRef.current && portalRef.current.contains(e.target)) return

      // Update coords instead of closing, keeps it attached when scrolling
      updateCoords();
    };

    if (isOpen) {
      updateCoords();
      window.addEventListener("resize", updateCoords);
      window.addEventListener("scroll", handleScroll, true);
      return () => {
        window.removeEventListener("resize", updateCoords);
        window.removeEventListener("scroll", handleScroll, true);
      };
    }
  }, [isOpen]);

  const filteredOptions = useMemo(() => {
    if (!enableSearch || !searchQuery) return options;
    const query = searchQuery.toLowerCase().trim();
    const cleanQuery = query.replace(/^\+/, "");
    const queryNoDiacritics = removeDiacritics(cleanQuery).replace(/\s+/g, "");

    return options.filter((opt) => {
      const label = String(opt.label ?? "").toLowerCase();
      const val = String(opt.value ?? "").toLowerCase();
      const subtitle = String(opt.subtitle ?? "").toLowerCase();
      const searchTerms = String(opt.searchTerms ?? "").toLowerCase();

      const cleanVal = val.replace(/^\+/, "");
      const cleanSearchTerms = searchTerms.replace(/\+/g, "");

      const matchLabel = removeDiacritics(label)
        .replace(/\s+/g, "")
        .includes(queryNoDiacritics);
      const matchSubtitle = removeDiacritics(subtitle)
        .replace(/\s+/g, "")
        .includes(queryNoDiacritics);
      const matchSearchTerms = removeDiacritics(cleanSearchTerms)
        .replace(/\s+/g, "")
        .includes(queryNoDiacritics);

      return (
        label.includes(query) ||
        val.includes(query) ||
        cleanVal.includes(cleanQuery) ||
        subtitle.includes(query) ||
        searchTerms.includes(query) ||
        cleanSearchTerms.includes(cleanQuery) ||
        matchLabel ||
        matchSubtitle ||
        matchSearchTerms
      );
    });
  }, [options, enableSearch, searchQuery]);

  const handleSelect = (option) => {
    if (onChange) onChange(option.value, option);
    setIsOpen(false);
  };

  const selectedOption = options.find((opt) => opt.value === value) || null;

  const defaultTrigger = (
    <PillButton
      type="button"
      onClick={() => !disabled && setIsOpen(!isOpen)}
      disabled={disabled}
      variant="secondary"
      startIcon={selectedOption?.icon}
      endIcon={
        <ChevronDown
          className={`shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      }
      className={`w-full ${triggerClassName}`}
    >
      <span className="flex-1 text-left truncate min-w-0">
        {selectedOption ? selectedOption.label : placeholder}
      </span>
    </PillButton>
  );

  const defaultRenderOption = (option, isSelected) => {
    return (
      <MenuItem
        isSelected={isSelected}
        activeColor={option.color || activeColor}
        icon={option.icon}
        label={option.label}
        rightText={option.rightText}
        rightContent={option.rightContent}
      />
    )
  }

  const alignClass = portalCoords?.forceAlignRight
    ? "right-0 origin-top-right"
    : align === "right"
      ? "right-0 origin-top-right"
      : align === "center"
        ? "-translate-x-1/2 left-1/2 origin-top"
        : "left-0 origin-top-left";

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {trigger
        ? typeof trigger === "function"
          ? trigger(
              isOpen,
              selectedOption,
              () => !disabled && setIsOpen(!isOpen),
            )
          : React.cloneElement(trigger, {
              onClick: () => !disabled && setIsOpen(!isOpen),
              disabled,
            })
        : defaultTrigger}

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {isOpen && portalCoords && (
              <div
                ref={portalRef}
                style={{
                  position: "absolute",
                  top: portalCoords.top,
                  left: portalCoords.left,
                  width: portalCoords.width,
                  height: portalCoords.height,
                  zIndex: 9999,
                  pointerEvents: "none",
                }}
              >
                <div className="relative w-full h-full">
                  <FluentAnimation
                    direction={portalCoords.flipUp ? "up" : "down"}
                    exit={true}
                    className={`absolute ${portalCoords.flipUp ? "bottom-full mb-2 origin-bottom" : "top-full mt-2"} flex flex-col pointer-events-auto shadow-lg border border-[#E5E5E5] rounded-xl bg-white ${maxHeightClass} overflow-hidden ${alignClass} ${dropdownClassName}`}
                  >
                    {enableSearch && (
                      <div className="px-3 py-2 shrink-0 bg-white z-10 border-b border-gray-100">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={14} className="text-gray-400" />
                          </div>
                          <input
                            ref={searchInputRef}
                            type="text"
                            className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-cath-red-700"
                            placeholder={searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                    )}
                    <div className="flex-1 py-[2px] overflow-y-auto overflow-x-hidden">
                      {filteredOptions.length > 0 ? (
                        filteredOptions.map((option, idx) => {
                          const isSelected = option.value === value;
                          const optionKey =
                            option.key ||
                            option.code ||
                            (option.value ? `${option.value}-${idx}` : idx);

                          return renderOption ? (
                            <button
                              key={optionKey}
                              type="button"
                              onClick={() => handleSelect(option)}
                              className="group w-full flex items-center focus:outline-none px-1 h-12"
                            >
                              {renderOption(option, isSelected)}
                            </button>
                          ) : (
                            <MenuItem
                              key={optionKey}
                              onClick={() => handleSelect(option)}
                              isSelected={isSelected}
                              activeColor={option.color || activeColor}
                              icon={option.icon}
                              label={option.label}
                              rightText={option.rightText}
                              rightContent={option.rightContent}
                            />
                          );
                        })
                      ) : (
                        <div className="px-3 py-4 text-sm text-center text-gray-500">
                          {t?.noOptionsFound || "No options found"}
                        </div>
                      )}
                    </div>
                  </FluentAnimation>
                </div>
              </div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
};

export default Dropdown;
