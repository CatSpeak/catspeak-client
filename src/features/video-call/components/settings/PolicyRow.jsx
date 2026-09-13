import React from "react"
import Switch from "@/shared/components/ui/inputs/Switch"
import InfoPopover from "./InfoPopover"

/**
 * Compact switch row for room policy toggles inside the participant / host panel.
 *
 * The row is clickable to toggle the switch; description is accessible via InfoPopover.
 * Text is allowed to wrap cleanly without awkward truncation.
 */
const PolicyRow = ({
  icon,
  label,
  checked,
  onChange,
  disabled = false,
  colorClass = "peer-checked:bg-cath-red-700",
  description,
}) => {
  const handleToggle = () => {
    if (!disabled && onChange) {
      onChange({ target: { checked: !checked } })
    }
  }

  const handleKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === " ") && !disabled) {
      e.preventDefault()
      handleToggle()
    }
  }

  return (
    <div
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      className={`group flex items-center justify-between gap-3 rounded-xl border border-neutral-200/90 bg-white px-3.5 py-2.5 transition-all select-none ${
        disabled
          ? "cursor-not-allowed opacity-60"
          : "cursor-pointer hover:border-neutral-300 hover:bg-neutral-50/80 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cath-red-700/40"
      }`}
    >
      <div className="flex min-w-0 items-center gap-2.5 flex-1">
        {icon && (
          <span className="shrink-0 text-neutral-500 group-hover:text-cath-red-700 transition-colors">
            {icon}
          </span>
        )}
        <span className="text-xs font-medium text-neutral-800 leading-snug break-words flex-1">
          {label}
        </span>
        {description && (
          <span onClick={(e) => e.stopPropagation()} className="shrink-0">
            <InfoPopover text={description} label={label} />
          </span>
        )}
      </div>

      <div onClick={(e) => e.stopPropagation()} className="shrink-0 ml-1">
        <Switch
          size="sm"
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          colorClass={colorClass}
          aria-label={label}
        />
      </div>
    </div>
  )
}

export default PolicyRow
