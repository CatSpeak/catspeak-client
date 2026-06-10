import React from "react"
import { ChevronDown } from "lucide-react"
import Dropdown from "@/shared/components/ui/Dropdown"
import { countries } from "@/shared/constants/countriesData"

const CountryDropdown = ({ value, onChange, className = "" }) => {
  const countryOptions = countries.map((c) => ({
    key: c.code,
    value: c.value,
    label: c.label,
    searchTerms: `${c.code} ${c.value} ${c.label}`,
    icon: (
      <img
        src={`https://flagcdn.com/w40/${c.value}.png`}
        className="w-[20px] h-[20px] rounded-full object-cover"
        alt={c.code}
      />
    ),
  }))

  const selectedCountry = countryOptions.find(
    (c) => c.value?.toLowerCase() === value?.toLowerCase()
  )

  return (
    <Dropdown
      options={countryOptions}
      value={value}
      onChange={onChange}
      enableSearch={true}
      searchPlaceholder="Search country..."
      className={className}
      dropdownClassName="min-w-[200px] max-w-[280px]"
      trigger={(isOpen, selectedOption, toggleDropdown) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            toggleDropdown()
          }}
          className="hover:bg-[#E5E5E5] rounded-lg h-10 flex items-center px-4 cursor-pointer w-full border-0 focus:outline-none bg-transparent"
        >
          <div className="flex items-center gap-3 text-sm font-bold text-[#8B1A1A] justify-between w-full">
            <span className="truncate">
              {selectedCountry ? selectedCountry.label : value || "Select Country..."}
            </span>
            <ChevronDown
              size={16}
              className={`shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            />
          </div>
        </button>
      )}
    />
  )
}

export default CountryDropdown
