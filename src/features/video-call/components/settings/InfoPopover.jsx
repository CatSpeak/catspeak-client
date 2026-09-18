import React from "react"
import { Info } from "lucide-react"
import Popover from "@/shared/components/ui/Popover"

/**
 * Small "ⓘ" affordance that reveals a policy description in a popover.
 * Keeps the narrow participant panel readable without dropping the copy.
 */
const InfoPopover = ({ text, label }) => {
  if (!text) return null

  return (
    <Popover
      placement="top-right"
      className="inline-flex shrink-0"
      triggerClassName="inline-flex"
      trigger={
        <button
          type="button"
          aria-label={label || "Info"}
          className="inline-flex h-5 w-5 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cath-red-700/40"
        >
          <Info size={14} aria-hidden="true" />
        </button>
      }
      content={
        <div className="w-64 rounded-xl border border-neutral-200 bg-white p-3 text-xs leading-relaxed text-neutral-600 shadow-lg">
          {text}
        </div>
      }
    />
  )
}

export default InfoPopover
