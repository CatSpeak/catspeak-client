import { colors } from "@/shared/utils/colors"
import { useLanguage } from "@/shared/context/LanguageContext"

const RecurrenceIntervalRow = ({ intervalUnit, value, onChange, disabled }) => {
  const { t } = useLanguage()
  const cal = t.calendar

  return (
    <div
      className="flex items-center gap-3 border border-border dark:border-[#3F3F3F] rounded-md px-4 h-[48px] shadow-sm bg-white dark:bg-[#272727]"
    >
      <span
        className="text-base font-medium shrink-0 text-gray-600 dark:text-neutral-400"
      >
        {cal.repeatEvery}
      </span>
      <input
        type="number"
        min={1}
        value={value}
        onChange={(e) => onChange(Math.max(1, Number(e.target.value)))}
        disabled={disabled}
        className={`w-14 text-center border border-border dark:border-[#3F3F3F] rounded-[5px] text-black dark:text-white bg-transparent text-base outline-none py-0.5 shadow-sm ${disabled ? "opacity-60 cursor-not-allowed bg-gray-50 dark:bg-[#1A1A1A]" : ""}`}
      />
      <span
        className="text-base font-medium text-gray-600 dark:text-neutral-400"
      >
        {intervalUnit}
      </span>
    </div>
  )
}

export default RecurrenceIntervalRow
