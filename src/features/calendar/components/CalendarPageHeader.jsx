import React from "react";
import { Plus, SlidersHorizontal } from "lucide-react";

const CalendarPageHeader = ({
  title,
  createLabel,
  onOpenFilters,
  onCreate,
}) => {
  return (
    <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
      <h1 className="text-3xl sm:text-4xl font-bold text-black">{title}</h1>
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenFilters}
          className="w-9 h-9 rounded-full border border-[#990011] flex items-center justify-center hover:bg-[#990011]/5 transition-colors text-[#990011]"
        >
          <SlidersHorizontal size={16} />
        </button>
        <button
          onClick={onCreate}
          className="flex items-center gap-1.5 px-4 h-9 rounded-full bg-[#990011] hover:bg-[#7a000e] text-white text-sm font-semibold transition-colors shadow-sm"
        >
          {createLabel}
          <Plus size={14} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

export default CalendarPageHeader;
