import React from "react";
import { SlidersHorizontal } from "lucide-react";

const CalendarPageHeader = ({
  title,
  onOpenFilters,
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
      </div>
    </div>
  );
};

export default CalendarPageHeader;
