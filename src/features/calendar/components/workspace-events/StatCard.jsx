import React, { memo } from "react";

const StatCard = memo(function StatCard({ label, value }) {
  return (
    <div className="bg-white border border-[#e5e5e5] rounded-xl p-4 shadow-sm flex flex-col">
      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
        {label}
      </span>
      <span className="text-xl font-extrabold text-gray-800 mt-1">{value}</span>
    </div>
  );
});

export default StatCard;
