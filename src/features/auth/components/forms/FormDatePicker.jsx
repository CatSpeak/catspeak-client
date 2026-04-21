import dayjs from "dayjs"

const FormDatePicker = ({
  placeholder,
  value,
  onChange,
  error,
  helperText,
}) => {
  const handleDateChange = (e) => {
    onChange({
      target: {
        value: e.target.value,
        type: "text",
      },
    })
  }

  return (
    <div>
      <input
        type="date"
        value={value || ""}
        onChange={handleDateChange}
        placeholder={placeholder}
        className={`h-10 w-full rounded-lg border px-3 text-sm outline-none transition-colors
          focus:border-cath-red-700 focus:ring-1 focus:ring-cath-red-700 hover:border-cath-red-700
          placeholder-gray-400
          ${error ? "border-red-600 focus:border-red-600 focus:ring-red-600" : "border-[#C6C6C6]"}`}
      />
      {helperText && (
        <p className="mt-1 text-xs text-red-600">{helperText}</p>
      )}
    </div>
  )
}

export default FormDatePicker
