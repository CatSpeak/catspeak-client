import React, { useRef, useState, useEffect } from "react";
import { SendHorizontal, ChevronDown, LayoutGrid, Wind } from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import TextInput from "@/shared/components/ui/inputs/TextInput";

/**
 * Shared input bar for creating stories.
 *
 * @param {Object}   props
 * @param {string}   props.inputValue
 * @param {(e: React.ChangeEvent) => void} props.onChange
 * @param {() => void} props.onSend
 * @param {number}   props.myCount
 * @param {number}   props.totalCount
 * @param {"newest"|"oldest"} props.sortOrder  - Current sort order
 * @param {(order: "newest"|"oldest") => void} props.onSortChange
 * @param {"grid"|"float"} props.displayMode   - Current display mode
 * @param {(mode: "grid"|"float") => void} props.onDisplayModeChange
 */
const StoryInputBar = ({
  inputValue,
  onChange,
  onSend,
  myCount,
  totalCount,
  sortOrder = "newest",
  onSortChange,
  displayMode = "float",
  onDisplayModeChange,
}) => {
  const { t } = useLanguage();
  const [sortOpen, setSortOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const sortLabel =
    sortOrder === "newest"
      ? t.catSpeak?.mail?.sortNewest
      : t.catSpeak?.mail?.sortOldest;

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4 w-full py-1 mb-2 sm:mb-3">
      {/* Left: text input + send button */}
      <div className="flex w-full md:w-auto justify-center items-start gap-2.5 flex-1 min-w-0">
        <TextInput
          value={inputValue}
          onChange={onChange}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          maxLength={200}
          placeholder={t.catSpeak.mail.placeholder}
          containerClassName="w-full flex-1 md:flex-initial md:w-[250px] lg:w-[440px] xl:w-[520px] min-w-0"
          className="!border-[#c38300]/70 focus:!border-cath-red-700 focus:!ring-cath-red-700 hover:!border-cath-red-700 !h-10"
          showCount
        />
        <button
          type="button"
          onClick={onSend}
          className="flex mt-0.5 h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cath-red-700 text-white transition hover:brightness-90 active:brightness-75"
          aria-label="Send message"
        >
          <SendHorizontal size={18} />
        </button>
      </div>

      {/* Right: sort + display mode + counter */}
      <div className="flex flex-col items-center justify-center w-full md:w-auto md:items-end gap-2 shrink-0">
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-2.5 sm:gap-3">
          {/* Sort dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setSortOpen((v) => !v)}
              className="flex h-9 items-center gap-1.5 rounded-full border border-cath-red-700 px-3.5 text-sm font-medium text-cath-red-700 transition hover:bg-cath-red-700/5 active:bg-cath-red-700/10"
            >
              {sortLabel}
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${sortOpen ? "rotate-180" : ""}`}
              />
            </button>

            {sortOpen && (
              <div className="absolute right-0 top-full z-50 mt-1.5 min-w-[120px] overflow-hidden rounded-xl border border-black/8 bg-white shadow-lg">
                {[
                  { value: "newest", label: t.catSpeak?.mail?.sortNewest },
                  { value: "oldest", label: t.catSpeak?.mail?.sortOldest },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      onSortChange?.(value);
                      setSortOpen(false);
                    }}
                    className={`flex w-full items-center px-4 py-2.5 text-sm transition hover:bg-[#f5f5f5] ${
                      sortOrder === value
                        ? "font-semibold text-cath-red-700"
                        : "text-[#3d3d3d]"
                    }`}
                  >
                    {label}
                    {sortOrder === value && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cath-red-700" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Display mode toggle */}
          <div className="flex h-9 items-center rounded-full bg-[#f0f0f0] p-0.5">
            <button
              type="button"
              onClick={() => onDisplayModeChange?.("grid")}
              title={t.catSpeak?.mail?.displayGrid}
              className={`flex h-8 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-all duration-200 ${
                displayMode === "grid"
                  ? "bg-cath-red-700 text-white shadow-sm"
                  : "text-[#7a7574] hover:text-[#3d3d3d]"
              }`}
            >
              <LayoutGrid size={14} />
              {t.catSpeak?.mail?.displayGrid}
            </button>
            <button
              type="button"
              onClick={() => onDisplayModeChange?.("float")}
              title={t.catSpeak?.mail?.displayFloat}
              className={`flex h-8 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-all duration-200 ${
                displayMode === "float"
                  ? "bg-cath-red-700 text-white shadow-sm"
                  : "text-[#7a7574] hover:text-[#3d3d3d]"
              }`}
            >
              <Wind size={14} />
              {t.catSpeak?.mail?.displayFloat}
            </button>
          </div>
        </div>

        {/* Counter */}
        <div className="text-sm whitespace-nowrap text-[#7A7574] text-center md:text-right">
          <span className="font-semibold">{myCount}</span>{" "}
          {t.catSpeak.mail.yours} |{" "}
          <span className="font-semibold">{totalCount}</span>{" "}
          {t.catSpeak.mail.total}
        </div>
      </div>
    </div>
  );
};

export default StoryInputBar;
