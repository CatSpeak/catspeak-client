import React from "react"
import { Globe, Link, Users, ChevronDown } from "lucide-react"
import Dropdown from "@/shared/components/ui/Dropdown"
import { useLanguage } from "@/shared/context/LanguageContext"

const VisibilityDropdown = ({ value, onChange, color = "#B91264" }) => {
  const { t } = useLanguage()
  const cal = t.calendar

  const OPTIONS = [
    {
      value: "Công khai",
      shortLabel: cal.public,
      label: cal.public,
      icon: <Globe size={16} />,
    },
    {
      value: "Link",
      shortLabel: cal.linkOnly,
      label: cal.linkOnly,
      icon: <Link size={16} />,
    },
    // Uncomment when backend supports COMMUNITY_ONLY
    // {
    //   value: "Cộng đồng",
    //   shortLabel: cal.community,
    //   label: cal.community,
    //   icon: <Users size={16} />,
    // },
  ]
  const selectedOpt = OPTIONS.find((o) => o.label === value) || OPTIONS[0]

  const trigger = (isOpen, selectedOption, toggle) => {
    const icon = React.cloneElement(selectedOption ? selectedOption.icon : selectedOpt.icon, { size: 14 })
    return (
      <button
        type="button"
        onClick={toggle}
        className="flex items-center gap-2 border border-white rounded-full px-3 py-1.5 bg-white text-black hover:bg-gray-50 transition-colors"
      >
        <div style={{ color }}>{icon}</div>
        <span className="text-sm font-medium">{selectedOption ? selectedOption.shortLabel : selectedOpt.shortLabel}</span>
        <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>
    )
  }

  const enhancedOptions = OPTIONS.map((opt) => ({
    ...opt,
    color,
  }))

  return (
    <Dropdown
      options={enhancedOptions}
      value={selectedOpt.value}
      onChange={(val, opt) => {
        if (onChange) onChange(opt.label)
      }}
      trigger={trigger}
      align="right"
      className="inline-block text-black"
      dropdownClassName="min-w-[200px]"
    />
  )
}

export default VisibilityDropdown
