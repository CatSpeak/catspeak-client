import { memo } from "react"
import { useTimezone } from "@/shared/hooks/useTimezone"

/**
 * DateSeparator — horizontal line with date label between message groups.
 */
const DateSeparator = memo(({ timestamp }) => {
  const { formatDate } = useTimezone()

  return (
    <div className="flex items-center gap-4 p-4">
      <div className="flex-1 h-[1px] bg-border dark:bg-[#3F3F3F]"></div>
      <span className="text-xs text-[#606060] dark:text-[#AAAAAA] font-medium whitespace-nowrap">
        {formatDate(timestamp)}
      </span>
      <div className="flex-1 h-[1px] bg-border dark:bg-[#3F3F3F]"></div>
    </div>
  )
})

DateSeparator.displayName = "DateSeparator"

export default DateSeparator
