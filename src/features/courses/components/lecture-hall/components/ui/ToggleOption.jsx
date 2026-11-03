import React from "react"
import Switch from "@/shared/components/ui/inputs/Switch"

const ToggleOption = ({
  icon,
  iconBg = "bg-[#FFDAD4]",
  title,
  description,
  checked,
  onChange,
  className = "",
}) => (
  <div className={`flex items-center justify-between p-4 bg-[#f5f5f5] dark:bg-[#222222] rounded-xl border border-transparent dark:border-[#3F3F3F] ${className}`}>
    <div className="flex items-center gap-4">
      <div
        className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center shrink-0`}
      >
        {icon}
      </div>
      <div>
        <p className="font-semibold text-sm text-[#191C1D] dark:text-white">{title}</p>
        {description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>}
      </div>
    </div>
    <Switch
      checked={checked}
      onChange={onChange}
      colorClass="peer-checked:bg-[#A00000] dark:peer-checked:bg-[#FF6B6B]"
      className="!h-6"
    />
  </div>
)

export default ToggleOption
