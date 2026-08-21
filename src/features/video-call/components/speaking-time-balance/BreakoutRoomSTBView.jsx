import React from "react"

/**
 * BreakoutRoomSTBView Component
 * Renders the Speaking Time Balance panel specifically for Breakout Rooms.
 * Matches design in stb-detail-breakout-panel.png:
 *   - No Teacher Talk card
 *   - Room Student summary (HV phòng (N) | Kỳ vọng: X%)
 *   - Column headers (Tên | % | # từ)
 *   - Clean normal & low-thread student rows
 */
const BreakoutRoomSTBView = ({
  studentCount = 0,
  expectedSharePercent = 0,
  participantStatsList = [],
  labels = {},
}) => {
  return (
    <div className="flex-1 overflow-y-auto py-2">
      {/* Summary Box */}
      <div className="bg-[#F8F9FA] rounded-xl p-3.5 mx-4 mb-3 flex items-center justify-between text-xs font-semibold text-gray-700">
        <span>
          {labels.roomStudents
            ? labels.roomStudents.replace("{count}", String(studentCount))
            : `HV phòng (${studentCount})`}
        </span>
        <span className="text-gray-500 font-mono">
          {labels.expected
            ? labels.expected.replace("{percent}", String(expectedSharePercent))
            : `Kỳ vọng: ${expectedSharePercent}%`}
        </span>
      </div>

      {/* Column Headers */}
      <div className="flex items-center justify-between px-6 py-2 text-xs font-medium text-gray-400 border-t border-gray-100 mb-2">
        <span>{labels.colName || "Tên"}</span>
        <div className="flex items-center gap-8">
          <span className="w-8 text-right">{labels.colPercent || "%"}</span>
          <span className="w-10 text-right">{labels.colWords || "# từ"}</span>
        </div>
      </div>

      {/* Student List */}
      <div className="px-4 space-y-2">
        {participantStatsList.map((item, idx) => {
          const isLowThread =
            item.status === "tooLow" || item.status === "attention"

          if (isLowThread) {
            return (
              <div
                key={item.participant.identity || idx}
                className="bg-[#FEF2F2] border border-red-100 rounded-xl p-3.5 flex items-center justify-between text-sm transition-all"
              >
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <span className="inline-flex items-center justify-center bg-[#DC2626] text-white font-bold text-xs px-1.5 py-0.5 rounded shrink-0 shadow-sm">
                    !!
                  </span>
                  <span className="font-bold text-[#991B1B] truncate">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-8 shrink-0">
                  <span className="font-bold text-gray-900 w-8 text-right font-mono">
                    {item.sharePercent}%
                  </span>
                  <span className="text-gray-400 font-mono w-10 text-right">
                    {item.totalWords}
                  </span>
                </div>
              </div>
            )
          }

          return (
            <div
              key={item.participant.identity || idx}
              className="bg-[#F8F9FA] rounded-xl p-3.5 flex items-center justify-between text-sm transition-all"
            >
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <span className="font-normal text-gray-800 truncate">
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-8 shrink-0">
                <span className="font-medium text-gray-900 w-8 text-right font-mono">
                  {item.sharePercent}%
                </span>
                <span className="text-gray-400 font-mono w-10 text-right">
                  {item.totalWords}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default BreakoutRoomSTBView
