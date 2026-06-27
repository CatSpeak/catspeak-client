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
}) => (
  <button
    disabled={disabled}
    onClick={(e) => {
      if (disabled) e.preventDefault()
      else onSelect(code, label)
    }}
    className={`relative flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors ${
      disabled
        ? "cursor-not-allowed text-gray-400"
        : isActive
          ? "text-cath-red-800 font-medium"
          : "text-gray-700 hover:bg-gray-50"
    }`}
  >
    {isActive && (
      <motion.div 
        layoutId="lang-active-indicator"
        className="absolute inset-0 rounded-xl bg-gray-500/5 pointer-events-none"
      />
    )}
    <span className="flex h-7 w-7 shrink-0 overflow-hidden rounded-full border border-gray-100">
      <img
        src={flag}
        alt={label}
        className={`block h-full w-full object-cover ${
          disabled ? "grayscale opacity-50" : ""
        }`}
        draggable={false}
      />
    </span>
    <span className="min-w-0 flex-1 truncate text-[14px]">
      {label}
    </span>
    {disabled ? (
      <span className="shrink-0 ml-auto rounded-full border border-gray-200 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-400">
        {soonLabel}
      </span>
    ) : isActive ? (
      <div className="ml-auto flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-[2px] border-cath-red-800">
        <div className="h-2 w-2 rounded-full bg-cath-red-800" />
      </div>
    ) : (
      <div className="ml-auto flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-[2px] border-gray-200" />
    )}
  </button>
)

export default LanguageMenuItem
