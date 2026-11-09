import { ChevronDown } from "lucide-react"

const FormSelectField = ({
  placeholder,
  value,
  onChange,
  error,
  errorText,
  options,
}) => {
  return (
    <div>
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className={`h-10 w-full appearance-none rounded-lg border bg-white dark:bg-[#272727] px-3 pr-10 text-sm outline-none transition-colors
            focus:border-cath-red-700 dark:focus:border-red-400 focus:ring-1 focus:ring-cath-red-700 hover:border-cath-red-700 dark:hover:border-red-400
            ${!value ? "text-gray-400 dark:text-neutral-500" : "text-gray-900 dark:text-white"}
            ${error ? "border-red-600 focus:border-red-600 focus:ring-red-600" : "border-[#C6C6C6] dark:border-[#3F3F3F]"}`}
        >
          {placeholder && (
            <option value="" disabled className="bg-white dark:bg-[#272727] text-gray-400 dark:text-neutral-500">
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-white dark:bg-[#272727] text-gray-900 dark:text-white">
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-400"
        />
      </div>
      {errorText && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errorText}</p>
      )}
    </div>
  )
}

export default FormSelectField
