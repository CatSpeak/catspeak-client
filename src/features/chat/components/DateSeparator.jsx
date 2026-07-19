import { memo } from "react"
import { formatDateSeparator } from "@/shared/utils/dateFormatter"

/**
 * DateSeparator — horizontal line with date label between message groups.
 */
const DateSeparator = memo(({ timestamp }) => (
  <div className="flex items-center gap-4 p-4">
    <div className="flex-1 h-[1px] bg-border"></div>
    <span className="text-xs text-[#606060] whitespace-nowrap">
      {formatDateSeparator(timestamp)}
    </span>
    <div className="flex-1 h-[1px] bg-border"></div>
  </div>
))

DateSeparator.displayName = "DateSeparator"

export default DateSeparator
