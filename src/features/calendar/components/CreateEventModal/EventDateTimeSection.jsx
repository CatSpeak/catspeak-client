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
  errors,
}) => {
  const { t } = useLanguage()
  const cal = t.calendar

  return (
    <div className="flex flex-col gap-6 items-start w-full">
      {/* Start / End time & Timezone */}
      <div className="flex flex-col gap-6 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
          <span className="text-base w-[150px] shrink-0 font-medium">{cal.startTime}</span>
          <div className="flex flex-col gap-1 flex-1">
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-6">
              <DatePicker
                value={toDate(startTime)}
                onChange={(d) => {
                  const newDate = dayjs(d)
                  const current = startTime ? dayjs(toDate(startTime)) : dayjs().hour(0).minute(0).second(0)
                  onStartTimeChange(
                    current
                      .year(newDate.year())
                      .month(newDate.month())
                      .date(newDate.date())
                      .toDate()
                  )
                }}
                color={eventColor}
                className={errors?.startTime ? "border-red-500 rounded-2xl" : ""}
              />
              <TimeDropdown
                value={startTime ? formatTime(toDate(startTime)) : ""}
                color={eventColor}
                onChange={(hhmm) => {
                  const [h, m] = hhmm.split(":")
                  const base = startTime ? dayjs(toDate(startTime)) : dayjs().startOf('day')
                  onStartTimeChange(
                    base
                      .hour(Number(h))
                      .minute(Number(m))
                      .second(0)
                      .toDate(),
                  )
                }}
                className={errors?.startTime ? "border-red-500 rounded-2xl" : ""}
              />
            </div>
            {errors?.startTime && (
              <span className="text-red-500 text-sm mt-1">{errors.startTime}</span>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-0">
          <span className="text-base w-[150px] shrink-0 mt-3 font-medium">{cal.endTime}</span>
          <div className="flex flex-col gap-1 flex-1">
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-6">
              <DatePicker
                value={toDate(endTime)}
                onChange={(d) => {
                  const newDate = dayjs(d)
                  const current = endTime ? dayjs(toDate(endTime)) : dayjs().hour(0).minute(0).second(0)
                  onEndTimeChange(
                    current
                      .year(newDate.year())
                      .month(newDate.month())
                      .date(newDate.date())
                      .toDate()
                  )
                }}
                color={eventColor}
                className={errors?.endTime ? "border-red-500 rounded-2xl" : ""}
              />
              <TimeDropdown
                value={endTime ? formatTime(toDate(endTime)) : ""}
                color={eventColor}
                onChange={(hhmm) => {
                  const [h, m] = hhmm.split(":")
                  const base = endTime ? dayjs(toDate(endTime)) : dayjs().startOf('day')
                  onEndTimeChange(
                    base
                      .hour(Number(h))
                      .minute(Number(m))
                      .second(0)
                      .toDate(),
                  )
                }}
                className={errors?.endTime ? "border-red-500 rounded-2xl" : ""}
              />
            </div>
            {errors?.endTime && (
              <span className="text-red-500 text-sm mt-1">{errors.endTime}</span>
            )}
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
