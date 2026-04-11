import React from "react"

const TimelineGrid = ({ hourHeight }) => {
  return (
    <>
      {Array.from({ length: 24 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-full flex items-start"
          style={{ top: `${i * hourHeight}px` }}
        >
          <div className="w-16 text-sm text-[#606060] font-semibold text-right pr-4 shrink-0 -mt-2.5">
            {i.toString().padStart(2, "0")}:00
          </div>
          <div className="flex-1 border-t border-gray-200/60"></div>
        </div>
      ))}
    </>
  )
}

export default TimelineGrid
