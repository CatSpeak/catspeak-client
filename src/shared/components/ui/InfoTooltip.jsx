import React from "react"
import { Info } from "lucide-react"
import Popover from "@/shared/components/ui/Popover"

const InfoTooltip = ({
  text,
  content,
  title,
  size = 15,
  placement = "top-left",
  iconClassName = "text-gray-400 hover:text-gray-600 transition-colors",
  trigger,
  className = "",
  panelClassName = "",
  ariaLabel = "Information",
}) => {
  if (!text && !content) return null

  const popoverContent = (
    <div
      className={`rounded-xl border border-gray-200 bg-white p-3 text-xs leading-relaxed text-gray-700 shadow-xl max-w-xs ${panelClassName}`}
    >
      {title && (
        <div className="font-bold text-gray-900 border-b border-gray-100 pb-1.5 mb-2">
          {title}
        </div>
      )}
      {content || text}
    </div>
  )

  const defaultTrigger = (
    <button
      type="button"
      aria-label={ariaLabel}
      className={`inline-flex items-center justify-center p-0.5 rounded-full hover:bg-gray-100/80 transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#990011]/30 ${className}`}
    >
      <Info size={size} className={iconClassName} />
    </button>
  )

  return (
    <Popover
      placement={placement}
      className="inline-flex shrink-0"
      triggerClassName="inline-flex"
      openOnHover
      trigger={trigger || defaultTrigger}
      content={popoverContent}
    />
  )
}

export default InfoTooltip
