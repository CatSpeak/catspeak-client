import React from "react";
import { X } from "lucide-react";

const CalendarFilterChips = ({ chips, onRemove }) => {
  if (!chips.length) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4 justify-end">
      {chips.map((chip) => (
        <div
          key={chip.key}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold text-black bg-[#F4AB1B]"
        >
          {chip.label}
          <button
            onClick={() => onRemove(chip.key)}
            className="hover:opacity-70 transition-opacity"
          >
            <X size={12} strokeWidth={3} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default CalendarFilterChips;
