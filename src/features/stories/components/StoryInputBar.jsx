import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  SendHorizontal,
  ChevronDown,
  ArrowUpDown,
  LayoutGrid,
  Wind,
} from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import TextInput from "@/shared/components/ui/inputs/TextInput";
import IconButton from "@/shared/components/ui/buttons/IconButton";
import Dropdown from "@/shared/components/ui/Dropdown";
import PillButton from "@/shared/components/ui/buttons/PillButton";
import Label from "@/shared/components/ui/Label";

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

  const sortOptions = useMemo(
    () => [
      { value: "newest", label: t.catSpeak?.mail?.sortNewest || "Newest" },
      { value: "oldest", label: t.catSpeak?.mail?.sortOldest || "Oldest" },
    ],
    [t.catSpeak?.mail]
  );

  const currentSortLabel = useMemo(() => {
    return (
      sortOptions.find((opt) => opt.value === sortOrder)?.label ||
      sortOptions[0]?.label ||
      "Newest"
    );
  }, [sortOptions, sortOrder]);

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full px-4">
      {/* Left: text input with built-in IconButton */}
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
        variant="rounded-full"
        placeholder={t.catSpeak.mail.placeholder}
        containerClassName="w-full flex-1 md:flex-initial md:w-[250px] lg:w-[440px] xl:w-[520px] min-w-0"
        showCount
        rightContent={
          <IconButton
            onClick={onSend}
            variant="primary"
            aria-label="Send message"
            title={t.catSpeak?.mail?.send || "Send"}
          >
            <SendHorizontal />
          </IconButton>
        }
      />

      {/* Right: sort + display mode + counter */}
      <div className="flex flex-col items-center justify-center w-full md:w-auto md:items-end gap-1 shrink-0">
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-2">
          {/* Sort dropdown */}
          <Dropdown
            options={sortOptions}
            value={sortOrder}
            onChange={(val) => onSortChange?.(val)}
            align="right"
            fitContent
            trigger={(isOpen, selectedOption, toggle) => (
              <PillButton
                onClick={toggle}
                variant="ghost"
                isActive={isOpen}
                startIcon={<ArrowUpDown />}
                endIcon={
                  <ChevronDown
                    className={`transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                }
                aria-label={`Sort by: ${selectedOption?.label || currentSortLabel}`}
              >
                {selectedOption?.label || currentSortLabel}
              </PillButton>
            )}
          />

          {/* Display mode toggle */}
          <div className="relative flex h-12 items-center rounded-full bg-primaryBg dark:bg-[#272727] p-1 border border-transparent dark:border-[#3F3F3F]">
            <button
              type="button"
              onClick={() => onDisplayModeChange?.("grid")}
              title={t.catSpeak?.mail?.displayGrid}
              className={`relative flex h-10 items-center rounded-full px-4 text-sm transition-colors duration-200 cursor-pointer select-none touch-manipulation before:absolute before:-inset-y-1 before:inset-x-0 before:content-[''] ${
                displayMode === "grid"
                  ? "text-white"
                  : "text-[#7a7574] hover:text-[#3d3d3d] dark:text-[#AAAAAA] dark:hover:text-white"
              }`}
            >
              {displayMode === "grid" && (
                <motion.div
                  layoutId="storyDisplayModeIndicator"
                  className="absolute inset-0 rounded-full bg-cath-red-700 shadow-sm"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <LayoutGrid size={20} />
                {t.catSpeak?.mail?.displayGrid}
              </span>
            </button>
            <button
              type="button"
              onClick={() => onDisplayModeChange?.("float")}
              title={t.catSpeak?.mail?.displayFloat}
              className={`relative flex h-10 items-center rounded-full px-4 text-sm transition-colors duration-200 cursor-pointer select-none touch-manipulation before:absolute before:-inset-y-1 before:inset-x-0 before:content-[''] ${
                displayMode === "float"
                  ? "text-white"
                  : "text-[#7a7574] hover:text-[#3d3d3d] dark:text-[#AAAAAA] dark:hover:text-white"
              }`}
            >
              {displayMode === "float" && (
                <motion.div
                  layoutId="storyDisplayModeIndicator"
                  className="absolute inset-0 rounded-full bg-cath-red-700 shadow-sm"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Wind size={20} />
                {t.catSpeak?.mail?.displayFloat}
              </span>
            </button>
          </div>
        </div>

        {/* Counter */}
        <Label as="div" className="whitespace-nowrap text-center md:text-right">
          <span className="font-semibold text-gray-900 dark:text-white">{myCount}</span>{" "}
          {t.catSpeak.mail.yours} |{" "}
          <span className="font-semibold text-gray-900 dark:text-white">{totalCount}</span>{" "}
          {t.catSpeak.mail.total}
        </Label>
      </div>
    </div>
  );
};

export default StoryInputBar;
