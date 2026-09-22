import React from "react"
import { ChevronDown } from "lucide-react"
import Dropdown from "@/shared/components/ui/Dropdown"

/** Square single-select trigger matching the language drawer mockups. */
const FormSelect = ({
  value,
  options,
  onChange,
  placeholder,
  disabled = false,
}) => (
  <Dropdown
    className="w-full"
    options={options}
    value={value}
    onChange={onChange}
    disabled={disabled}
    dropdownClassName="w-full min-w-full"
    trigger={(isOpen, selectedOption, toggle) => (
      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        className="flex h-11 w-full items-center justify-between gap-2 rounded-[7px] border border-[#D0D5DD] bg-white px-3.5 text-left text-[13px] text-[#101828] transition-colors hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span
          className={`truncate ${selectedOption ? "" : "text-[#98A2B3]"}`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-[#667085] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
    )}
  />
)

export default FormSelect
