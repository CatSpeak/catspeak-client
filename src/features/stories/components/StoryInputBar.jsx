import React, { useRef, useState, useEffect } from "react"
import { SendHorizontal, ChevronDown, LayoutGrid, Wind } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import TextInput from "@/shared/components/ui/inputs/TextInput"

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
  const { t } = useLanguage()
  const [sortOpen, setSortOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setSortOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const sortLabel = sortOrder === "newest" ? t.catSpeak?.mail?.sortNewest : t.catSpeak?.mail?.sortOldest

  return (
    <div className="md:mb-2 flex flex-col md:flex-row items-center justify-between gap-3 md:px-6 pt-1 -mx-1 -mt-1 md:pb-5 pb-2">
      {/* Left: text input + send button */}
      <div className="flex w-full items-start gap-2">
        <TextInput
          value={inputValue}
          onChange={onChange}
          maxLength={200}
          placeholder={t.catSpeak.mail.placeholder}
          containerClassName="flex-1 lg:max-w-[500px] xl:max-w-[540px] md:max-w-[320px] md:flex-none w-full"
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
      <div className="flex flex-col shrink-0 items-end gap-2">
        <div className="flex gap-4">
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
                    className={`flex w-full items-center px-4 py-2.5 text-sm transition hover:bg-[#f5f5f5] ${sortOrder === value
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
              className={`flex h-8 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-all duration-200 ${displayMode === "grid"
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
              className={`flex h-8 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-all duration-200 ${displayMode === "float"
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
        <div className="text-sm whitespace-nowrap text-[#7A7574]">
          <span className="font-semibold">{myCount}</span>{" "}
          {t.catSpeak.mail.yours} |{" "}
          <span className="font-semibold">{totalCount}</span>{" "}
          {t.catSpeak.mail.total}
        </div>
      </div>
    </div>
  );
}

export default StoryInputBar
