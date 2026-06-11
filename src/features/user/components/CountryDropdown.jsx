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

  const getDisplayLabel = () => {
    return selectedCountry ? selectedCountry.label : value || "Select Country..."
  }

  return (
    <Dropdown
      options={countryOptions}
      value={value}
      onChange={onChange}
      enableSearch={true}
      searchPlaceholder="Search country..."
      className={`relative ${className}`}
      dropdownClassName="min-w-[200px] max-w-[280px]"
      trigger={(isOpen, selectedOption, toggleDropdown) => (
        <div
          onClick={(e) => {
            e.stopPropagation()
            toggleDropdown()
          }}
          className="bg-white border border-[#e2e2e2] hover:bg-gray-50 transition-colors duration-200 rounded-2xl h-12 flex items-center px-4 cursor-pointer w-full focus:outline-none"
        >
          <div className="flex items-center gap-3 text-base text-gray-900 justify-between w-full">
            <span className="truncate">{getDisplayLabel()}</span>

            <ChevronDown
              size={18}
              className={`transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>
      )}
    />
  )
}

export default CountryDropdown
