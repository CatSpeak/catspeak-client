import dayjs from "dayjs"
import DatePicker from "@/shared/components/ui/inputs/DatePicker"
import TimeDropdown from "../ui/TimeDropdown"
import TimezoneDropdown from "../ui/TimezoneDropdown"
import { formatTime } from "@/shared/utils/dateFormatter"
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
}) => {
  const { t } = useLanguage()
  const cal = t.calendar

  return (
    <div className="flex flex-col gap-6 items-start w-full">
      {/* Start / End time & Timezone */}
      <div className="flex flex-col gap-6 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
          <span className="text-base w-[150px] shrink-0">{cal.startTime}</span>
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-6">
            <DatePicker
              value={toDate(startTime)}
              onChange={(d) => {
                const newDate = dayjs(d)
                const current = dayjs(toDate(startTime))
                onStartTimeChange(
                  current
                    .year(newDate.year())
                    .month(newDate.month())
                    .date(newDate.date())
                    .toDate()
                )
              }}
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
              onChange={(d) => {
                const newDate = dayjs(d)
                const current = dayjs(toDate(endTime))
                onEndTimeChange(
                  current
                    .year(newDate.year())
                    .month(newDate.month())
                    .date(newDate.date())
                    .toDate()
                )
              }}
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
    </div>
  )
}

export default EventDateTimeSection
