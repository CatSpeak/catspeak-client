import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import DatePicker from "@/shared/components/ui/inputs/DatePicker";
import TimeDropdown from "../ui/TimeDropdown";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useTimezone } from "@/shared/hooks/useTimezone";

dayjs.extend(utc);
dayjs.extend(timezone);

/** Safely converts a Firestore Timestamp or plain Date to a JS Date */
const toDate = (value) =>
  value && typeof value.toDate === "function" ? value.toDate() : value;

const EventDateTimeSection = ({
  eventColor,
  startTime,
  onStartTimeChange,
  endTime,
  onEndTimeChange,
  errors,
  children,
}) => {
  const { t } = useLanguage();
  const { formatTime, userTimeZone, buildDateTimeInZone } = useTimezone();
  const cal = t.calendar;

  const tz = userTimeZone || "Asia/Ho_Chi_Minh";

  const getDatePickerValue = (date) => {
    if (!date) return null;
    const d = toDate(date);
    return dayjs(d).tz(tz).format("YYYY-MM-DD");
  };

  return (
    <div className="flex flex-col gap-6 items-start w-full">
      {/* Start / End time */}
      <div className="flex flex-col gap-6 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
          <span className="text-base w-[150px] shrink-0 font-medium">
            {cal.startTime}
          </span>
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <DatePicker
                value={getDatePickerValue(startTime)}
                onChange={(d) => {
                  onStartTimeChange(buildDateTimeInZone(startTime, d, null));
                }}
                color={eventColor}
                className={
                  errors?.startTime ? "border-red-500 rounded-2xl" : ""
                }
              />
              <TimeDropdown
                value={startTime ? formatTime(startTime) : ""}
                color={eventColor}
                onChange={(hhmm) => {
                  onStartTimeChange(buildDateTimeInZone(startTime, null, hhmm));
                }}
                className={
                  errors?.startTime ? "border-red-500 rounded-2xl" : ""
                }
              />
            </div>
            {errors?.startTime && (
              <span className="text-red-500 text-xs mt-1">
                {errors.startTime}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-0">
          <span className="text-base w-[150px] shrink-0 mt-3 font-medium">
            {cal.endTime}
          </span>
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <DatePicker
                value={getDatePickerValue(endTime)}
                onChange={(d) => {
                  onEndTimeChange(buildDateTimeInZone(endTime, d, null));
                }}
                color={eventColor}
                className={errors?.endTime ? "border-red-500 rounded-2xl" : ""}
              />
              <TimeDropdown
                value={endTime ? formatTime(endTime) : ""}
                color={eventColor}
                onChange={(hhmm) => {
                  onEndTimeChange(buildDateTimeInZone(endTime, null, hhmm));
                }}
                className={errors?.endTime ? "border-red-500 rounded-2xl" : ""}
              />
            </div>
            {errors?.endTime && (
              <span className="text-red-500 text-xs mt-1">
                {errors.endTime}
              </span>
            )}
          </div>
        </div>

        {children}
      </div>
    </div>
  );
};

export default EventDateTimeSection;
