import dayjs from "dayjs"
import { useMemo } from "react"
import { AlertCircle } from "lucide-react"
import DatePicker from "@/shared/components/ui/inputs/DatePicker"
import TimeDropdown from "../ui/TimeDropdown"
import TimezoneDropdown from "../ui/TimezoneDropdown"
import RecurrenceDropdown from "../ui/RecurrenceDropdown"
import RecurrenceDays from "../ui/RecurrenceDays"
import RecurrenceIntervalRow from "./RecurrenceIntervalRow"
import { formatTime } from "@/shared/utils/dateFormatter"
import { colors } from "@/shared/utils/colors"
import { useLanguage } from "@/shared/context/LanguageContext"
import { calculateExactOccurrences } from "../../utils/recurrenceCalculator"

/** Safely converts a Firestore Timestamp or plain Date to a JS Date */
const toDate = (value) =>
  value && typeof value.toDate === "function" ? value.toDate() : value

const EventDateTimeSection = ({
  eventColor,
  startTime,
  onStartTimeChange,
  endTime,
  onEndTimeChange,
  selectedTimezone,
  onTimezoneChange,
  recurrenceOption,
  onRecurrenceChange,
  recurrenceInterval,
  onRecurrenceIntervalChange,
  selectedDays,
  onSelectedDaysChange,
  recurrenceEndDate,
  onRecurrenceEndDateChange,
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
  ])

  return (
    <div className="flex flex-col gap-6 items-start w-full">
      {/* Start / End time & Timezone */}
      <div className="flex flex-col gap-6 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
          <span className="text-base w-[150px] shrink-0">{cal.startTime}</span>
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-6">
            <DatePicker
              value={toDate(startTime)}
              onChange={(d) => onStartTimeChange(d)}
              color={eventColor}
            />
            <TimeDropdown
              value={formatTime(toDate(startTime))}
              color={eventColor}
              onChange={(hhmm) => {
                const [h, m] = hhmm.split(":")
                onStartTimeChange(
                  dayjs(toDate(startTime))
                    .hour(Number(h))
                    .minute(Number(m))
                    .second(0)
                    .toDate(),
                )
              }}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
          <span className="text-base w-[150px] shrink-0">{cal.endTime}</span>
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-6">
            <DatePicker
              value={toDate(endTime)}
              onChange={(d) => onEndTimeChange(d)}
              color={eventColor}
            />
            <TimeDropdown
              value={formatTime(toDate(endTime))}
              color={eventColor}
              onChange={(hhmm) => {
                const [h, m] = hhmm.split(":")
                onEndTimeChange(
                  dayjs(toDate(endTime))
                    .hour(Number(h))
                    .minute(Number(m))
                    .second(0)
                    .toDate(),
                )
              }}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
          <span className="text-base w-[150px] shrink-0">
            {cal.timezone || "Timezone"}
          </span>
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-6 w-full sm:w-auto">
            <TimezoneDropdown
              value={selectedTimezone}
              onChange={onTimezoneChange}
              activeColor={eventColor}
            />
          </div>
        </div>
      </div>

      {/* Recurrence */}
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
                  />
                </div>
              </div>
            )}

            {/* Recurrence end date */}
            <div className="flex flex-col gap-2 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                <span className="text-base w-[150px] shrink-0">
                  {cal.endsOn}
                </span>
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full">
                  <DatePicker
                    value={recurrenceEndDate}
                    onChange={onRecurrenceEndDateChange}
                    color={eventColor}
                  />
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
    </div>
  )
}

export default EventDateTimeSection
