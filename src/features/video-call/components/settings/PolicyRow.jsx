import React from "react"
import Switch from "@/shared/components/ui/inputs/Switch"
import InfoPopover from "./InfoPopover"

/**
 * Compact switch row for room policy toggles inside the participant panel.
 *
 * The label side is clickable as well as the switch itself; the optional
 * description renders behind an ⓘ popover so the 360px panel stays calm.
 */
const PolicyRow = ({
  icon,
  label,
  checked,
  onChange,
  disabled = false,
  colorClass = "peer-checked:bg-[#34C759]",
  description,
}) => (
  <div
    role="presentation"
    onClick={() => {
      // Match the switch's event shape so handlers can read e.target.checked.
      if (!disabled) onChange({ target: { checked: !checked } })
    }}
    className={`flex items-center justify-between gap-2 rounded-xl border border-neutral-200/80 bg-white px-3 py-2 transition-colors hover:bg-neutral-50 ${
      disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
    }`}
  >
    <span className="inline-flex min-w-0 items-center gap-2 text-xs font-medium text-neutral-700">
      <span className="shrink-0 text-neutral-500">{icon}</span>
      <span className="truncate">{label}</span>
      <InfoPopover text={description} label={label} />
    </span>
    <span onClick={(e) => e.stopPropagation()} className="shrink-0">
      <Switch
        size="sm"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        colorClass={colorClass}
        aria-label={label}
      />
    </span>
  </div>
)

export default PolicyRow
