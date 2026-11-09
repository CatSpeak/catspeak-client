import React from "react";
import { Plus, SlidersHorizontal } from "lucide-react";

const CalendarPageHeader = ({
  title,
  onCreateEvent,
  createLabel,
  onOpenFilters,
}) => {
  return (
    <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
      <h1 className="text-3xl sm:text-4xl font-bold text-black dark:text-white">{title}</h1>
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenFilters}
          className="w-9 h-9 rounded-full border border-[#990011] dark:border-red-400 flex items-center justify-center hover:bg-[#990011]/5 dark:hover:bg-red-400/10 transition-colors text-[#990011] dark:text-red-400"
        >
          <SlidersHorizontal size={16} />
        </button>
        <button
          onClick={onCreateEvent}
          className="flex items-center gap-1.5 h-9 px-4 rounded-full border border-[#990011] dark:border-red-400 text-[#990011] dark:text-red-400 text-sm font-semibold hover:bg-[#990011]/5 dark:hover:bg-red-400/10 transition-colors"
        >
          <Plus size={16} />
          <span>{createLabel}</span>
        </button>
      </div>
    </div>
  );
};

export default CalendarPageHeader;
