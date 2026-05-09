import React from "react"

const RecordingsListSkeleton = () => (
  <div className="flex flex-col gap-3">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm animate-pulse sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-center gap-2.5">
            <div className="h-5 w-20 rounded-full bg-gray-200" />
            <div className="h-4 w-32 rounded bg-gray-200" />
          </div>
          <div className="flex items-center gap-4">
            <div className="h-3.5 w-28 rounded bg-gray-200" />
            <div className="h-3.5 w-14 rounded bg-gray-200" />
            <div className="h-3.5 w-16 rounded bg-gray-200" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-gray-200" />
          <div className="h-9 w-9 rounded-lg bg-gray-200" />
          <div className="h-9 w-9 rounded-lg bg-gray-200" />
        </div>
      </div>
    ))}
  </div>
)

export default RecordingsListSkeleton
