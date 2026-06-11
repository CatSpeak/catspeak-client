import { useMemo } from "react"
import { AlertCircle } from "lucide-react"
import DatePicker from "@/shared/components/ui/inputs/DatePicker"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import RecurrenceDropdown from "../ui/RecurrenceDropdown"
import RecurrenceDays from "../ui/RecurrenceDays"
import RecurrenceIntervalRow from "./RecurrenceIntervalRow"
import { useLanguage } from "@/shared/context/LanguageContext"
import { calculateExactOccurrences } from "../../utils/recurrenceCalculator"

/** Safely converts a Firestore Timestamp or plain Date to a JS Date */
const toDate = (value) =>
  value && typeof value.toDate === "function" ? value.toDate() : value

const EventRecurrenceSection = ({
  isEditing,
  eventColor,
  startTime,
  recurrenceOption,
  onRecurrenceChange,
  recurrenceInterval,
  onRecurrenceIntervalChange,
  selectedDays,
  onSelectedDaysChange,
  recurrenceEndDate,
  onRecurrenceEndDateChange,
  recurrenceEndType,
  onRecurrenceEndTypeChange,
  occurrenceCount,
  onOccurrenceCountChange,
}) => {
  const { t } = useLanguage()
  const cal = t.calendar

  /** Human-readable unit label per recurrence option */
  const INTERVAL_UNIT = useMemo(
    () => ({
      DAILY: cal.intervalUnit.day,
      WEEKLY: cal.intervalUnit.week,
      MONTHLY: cal.intervalUnit.month,
      YEARLY: cal.intervalUnit.year,
      CUSTOM: cal.intervalUnit.week,
    }),
    [cal],
  )

  const WEEKLY_OPTIONS = useMemo(() => ["WEEKLY", "CUSTOM"], [])

  const isRecurring = recurrenceOption !== "NONE"
  const isWeekly = WEEKLY_OPTIONS.includes(recurrenceOption)
  const intervalUnit =
    INTERVAL_UNIT[recurrenceOption] ?? cal.intervalUnit.default

  const estimatedOccurrences = useMemo(() => {
    if (!isRecurring) return 1
    if (recurrenceEndType === "COUNT") return Number(occurrenceCount) || 1
    return calculateExactOccurrences(
      toDate(startTime),
      toDate(recurrenceEndDate),
      recurrenceOption,
      recurrenceInterval,
      selectedDays,
    )
  }, [
    isRecurring,
    startTime,
    recurrenceEndDate,
    recurrenceOption,
    recurrenceInterval,
    selectedDays,
    recurrenceEndType,
    occurrenceCount,
  ])

  if (isEditing) return null

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
        <span className="text-base w-[150px] shrink-0">
          {cal.repeatLabel || "Repeat"}
        </span>
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-6 w-full sm:w-auto">
          <RecurrenceDropdown
            value={recurrenceOption}
            onChange={onRecurrenceChange}
            activeColor={eventColor}
            disabled={isEditing}
          />
        </div>
      </div>

      {isRecurring && (
        <div className="flex flex-col gap-6 w-full">
          {/* Interval row — only shown for custom recurrence */}
          {recurrenceOption === "CUSTOM" && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
              <div className="w-[150px] shrink-0 hidden sm:block"></div>
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-6 w-full sm:w-auto">
                <RecurrenceIntervalRow
                  intervalUnit={intervalUnit}
                  value={recurrenceInterval}
                  onChange={onRecurrenceIntervalChange}
                  disabled={isEditing}
                />
              </div>
            </div>
          )}

          {/* Day-of-week picker — shown for weekly-type recurrences */}
          {isWeekly && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
              <div className="w-[150px] shrink-0 hidden sm:block"></div>
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-6 w-full sm:w-auto">
                <RecurrenceDays
                  value={selectedDays}
                  onChange={onSelectedDaysChange}
                  eventColor={eventColor}
                  disabled={isEditing}
                />
              </div>
            </div>
          )}

          {/* Recurrence end date */}
          <div className="flex flex-col gap-2 w-full">
            <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-0">
              <span className="text-base w-[150px] shrink-0 mt-[10px]">
                {cal.endsOn || "Ends"}
              </span>
              <div className="flex flex-col gap-4 w-full">
                
                {/* Option 1: On Date */}
                <label className="flex items-center gap-3 cursor-pointer group w-max">
                  <input 
                    type="radio" 
                    name="endType"
                    checked={recurrenceEndType === "DATE"} 
                    onChange={() => onRecurrenceEndTypeChange("DATE")}
                    className="w-4 h-4 cursor-pointer"
                    style={{ accentColor: eventColor }}
                    disabled={isEditing}
                  />
                  <div className={`transition-opacity ${recurrenceEndType !== "DATE" ? "opacity-50 pointer-events-none" : ""}`}>
                    <DatePicker
                      value={recurrenceEndDate}
                      onChange={onRecurrenceEndDateChange}
                      color={eventColor}
                      disabled={isEditing || recurrenceEndType !== "DATE"}
                    />
                  </div>
                </label>

                {/* Option 2: After N occurrences */}
                <label className="flex items-center gap-3 cursor-pointer group w-max">
                  <input 
                    type="radio" 
                    name="endType"
                    checked={recurrenceEndType === "COUNT"} 
                    onChange={() => onRecurrenceEndTypeChange("COUNT")}
                    className="w-4 h-4 cursor-pointer"
                    style={{ accentColor: eventColor }}
                    disabled={isEditing}
                  />
                  <span className="text-base">{cal.afterOccurrences || "After"}</span>
                  <div className={`flex items-start gap-3 transition-opacity ${recurrenceEndType !== "COUNT" ? "opacity-50 pointer-events-none" : ""}`}>
                    <TextInput
                      type="number"
                      value={occurrenceCount}
                      onChange={(e) => onOccurrenceCountChange(e.target.value)}
                      disabled={isEditing || recurrenceEndType !== "COUNT"}
                      variant="square"
                      color={eventColor}
                      className="text-center !px-2"
                      containerClassName="w-20"
                    />
                    <span className="text-base mt-[10px]">{cal.occurrences || "occurrences"}</span>
                  </div>
                </label>

              </div>
            </div>

            {estimatedOccurrences > 24 && (
              <div className="flex items-start gap-2 mt-1 p-3 bg-orange-50 border border-orange-200 rounded-lg text-orange-800 text-sm">
                <AlertCircle
                  size={18}
                  className="shrink-0 mt-0.5 text-orange-500"
                />
                <span>{cal.maxOccurrencesWarning}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default EventRecurrenceSection
