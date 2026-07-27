import React from "react"
import Switch from "@/shared/components/ui/inputs/Switch"

const ToggleOption = ({
  icon,
  iconBg = "bg-[#FFDAD4]",
  title,
  description,
  checked,
  onChange,
}) => (
  <div className="flex items-center justify-between py-4 border-b border-[#F3F4F5] last:border-b-0">
    <div className="flex items-center gap-4">
      <div
        className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center shrink-0`}
      >
        {icon}
      </div>
      <div>
        <p className="font-semibold text-sm text-[#191C1D]">{title}</p>
        <p className="text-xs text-[#5B403C]">{description}</p>
      </div>
    </div>
    <Switch
      checked={checked}
      onChange={onChange}
      colorClass="peer-checked:bg-[#A00000]"
      className="!h-6"
    />
  </div>
)

export default ToggleOption
