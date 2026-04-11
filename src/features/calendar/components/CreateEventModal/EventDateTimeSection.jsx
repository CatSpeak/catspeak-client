import dayjs from "dayjs"
import { useMemo } from "react"
import DatePicker from "@/shared/components/ui/inputs/DatePicker"
import TimeDropdown from "../ui/TimeDropdown"
import TimezoneDropdown from "../ui/TimezoneDropdown"
import RecurrenceDropdown from "../ui/RecurrenceDropdown"
import RecurrenceDays from "../ui/RecurrenceDays"
import RecurrenceIntervalRow from "./RecurrenceIntervalRow"
import { formatTime } from "@/shared/utils/dateFormatter"
import { colors } from "@/shared/utils/colors"
import { useLanguage } from "@/shared/context/LanguageContext"

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
      [cal.recurrence.daily]: cal.intervalUnit.day,
      [cal.recurrence.weekly]: cal.intervalUnit.week,
      [cal.recurrence.monthly]: cal.intervalUnit.month,
      [cal.recurrence.yearly]: cal.intervalUnit.year,
      [cal.recurrence.custom]: cal.intervalUnit.week,
    }),
    [cal],
  )

  const WEEKLY_OPTIONS = useMemo(
    () => [cal.recurrence.weekly, cal.recurrence.custom],
    [cal],
  )

  const isRecurring = recurrenceOption !== cal.recurrence.noRepeat
  const isWeekly = WEEKLY_OPTIONS.includes(recurrenceOption)
  const intervalUnit =
    INTERVAL_UNIT[recurrenceOption] ?? cal.intervalUnit.default

  return (
    <div className="flex flex-col gap-4 items-start pb-2 w-full">
      {/* Start / End time */}
      <div className="flex flex-col md:flex-row gap-3 md:gap-2 w-full xl:w-auto">
        <div className="flex flex-col justify-between gap-3 w-full md:w-auto">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
            <span className="text-base font-bold text-gray-900 w-[150px] shrink-0">
              {cal.startTime}
            </span>
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
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
            <span className="text-base font-bold text-gray-900 w-[150px] shrink-0">
              {cal.endTime}
            </span>
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
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
        </div>

        <div className="flex w-full md:w-auto mt-0 md:h-auto h-auto min-h-[86px]">
          <TimezoneDropdown
            value={selectedTimezone}
            onChange={onTimezoneChange}
            activeColor={eventColor}
          />
        </div>
      </div>

      {/* Recurrence */}
      <div className="flex flex-col gap-3 w-full">
        <RecurrenceDropdown
          value={recurrenceOption}
          onChange={onRecurrenceChange}
          activeColor={eventColor}
        />

        {isRecurring && (
          <div className="flex flex-col gap-3 w-full">
            {/* Interval row — only shown for custom recurrence */}
            {recurrenceOption === cal.recurrence.custom && (
              <RecurrenceIntervalRow
                intervalUnit={intervalUnit}
                value={recurrenceInterval}
                onChange={onRecurrenceIntervalChange}
              />
            )}

            {/* Day-of-week picker — shown for weekly-type recurrences */}
            {isWeekly && (
              <RecurrenceDays
                value={selectedDays}
                onChange={onSelectedDaysChange}
                eventColor={eventColor}
              />
            )}

            {/* Recurrence end date */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0 mt-1">
              <span className="text-base font-bold text-gray-900 w-[150px] shrink-0">
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
          </div>
        )}
      </div>
    </div>
  )
}

export default EventDateTimeSection
