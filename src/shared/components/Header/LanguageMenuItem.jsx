import React from "react"
import { motion } from "framer-motion"

const LanguageMenuItem = ({
  code,
  label,
  flag,
  disabled,
  onSelect,
  soonLabel,
  isActive,
  layoutId = "community-active-indicator",
  role = "option",
}) => (
  <button
    type="button"
    role={role}
    aria-selected={isActive}
    disabled={disabled}
    onClick={(e) => {
      if (disabled) e.preventDefault()
      else onSelect(code, label)
    }}
    className={`relative flex w-full items-center gap-2 rounded-xl px-3 h-11 text-left transition-colors ${
      disabled
        ? "cursor-not-allowed text-gray-400"
        : isActive
          ? "text-cath-red-800 dark:text-white font-medium bg-gray-50/60 dark:bg-white/10"
          : "text-gray-700 dark:text-[#AAAAAA] hover:bg-gray-50 dark:hover:bg-[#272727] dark:hover:text-white"
    }`}
  >
    {isActive && (
      <motion.div
        layoutId={layoutId}
        className="absolute inset-0 rounded-xl bg-gray-500/5 pointer-events-none"
      />
    )}
    <span className="flex h-5 w-5 shrink-0 overflow-hidden rounded-full border border-border">
      <img
        src={flag}
        alt={label}
        className={`block h-full w-full object-cover ${
          disabled ? "grayscale opacity-50" : ""
        }`}
        draggable={false}
      />
    </span>
    <span className="min-w-0 flex-1 truncate text-[14px]">{label}</span>
    {disabled ? (
      <span className="shrink-0 ml-auto rounded-full border border-border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-400">
        {soonLabel}
      </span>
    ) : isActive ? (
      <div className="ml-auto flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-[2px] border-cath-red-800 dark:border-white">
        <div className="h-2 w-2 rounded-full bg-cath-red-800 dark:bg-white" />
      </div>
    ) : (
      <div className="ml-auto flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-[2px] border-border dark:border-[#3F3F3F]" />
    )}
  </button>
)

export default LanguageMenuItem
