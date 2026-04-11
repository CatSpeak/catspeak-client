import { colors } from "@/shared/utils/colors"
import { useLanguage } from "@/shared/context/LanguageContext"

const RecurrenceIntervalRow = ({ intervalUnit, value, onChange }) => {
  const { t } = useLanguage()
  const cal = t.calendar

  return (
    <div
      className="flex items-center gap-3 border rounded-md px-4 h-[48px] shadow-sm bg-white"
      style={{ borderColor: colors.border }}
    >
      <span
        className="text-base font-medium shrink-0"
        style={{ color: colors.textGray }}
      >
        {cal.repeatEvery}
      </span>
      <input
        type="number"
        min={1}
        value={value}
        onChange={(e) => onChange(Math.max(1, Number(e.target.value)))}
        className="w-14 text-center border border-gray-200 rounded-[5px] text-black text-base outline-none py-0.5 shadow-sm"
      />
      <span
        className="text-base font-medium"
        style={{ color: colors.textGray }}
      >
        {intervalUnit}
      </span>
    </div>
  )
}

export default RecurrenceIntervalRow
