import React from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import DateTimePicker from "@/shared/components/ui/inputs/DateTimePicker";
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
  const cal = t.calendar || {};

  const tz = userTimeZone || "Asia/Ho_Chi_Minh";

  const getDatePickerValue = (date) => {
    if (!date) return null;
    const d = toDate(date);
    return dayjs(d).tz(tz).format("YYYY-MM-DD");
  };

  return (
    <div className="flex flex-col gap-6 items-start w-full">
      {/* Start / End time — 2 separate rows */}
      <div className="flex flex-col gap-5 w-full">
        {/* Row 1: Start time */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
          <span className="text-base w-[150px] shrink-0 font-medium">
            {cal.startTime}
          </span>
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <DateTimePicker
              dateValue={getDatePickerValue(startTime)}
              timeValue={startTime ? formatTime(startTime) : ""}
              onChange={(dateStr, timeStr) => {
                onStartTimeChange(buildDateTimeInZone(startTime, dateStr, timeStr));
              }}
              color={eventColor}
              error={Boolean(errors?.startTime)}
              className="w-[220px] h-11"
            />
            {errors?.startTime && (
              <span className="text-red-500 text-xs mt-1">
                {errors.startTime}
              </span>
            )}
          </div>
        </div>

        {/* Row 2: End time */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
          <span className="text-base w-[150px] shrink-0 font-medium">
            {cal.endTime}
          </span>
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <DateTimePicker
              dateValue={getDatePickerValue(endTime)}
              timeValue={endTime ? formatTime(endTime) : ""}
              onChange={(dateStr, timeStr) => {
                onEndTimeChange(buildDateTimeInZone(endTime, dateStr, timeStr));
              }}
              color={eventColor}
              error={Boolean(errors?.endTime)}
              className="w-[220px] h-11"
            />
            {errors?.endTime && (
              <span className="text-red-500 text-xs mt-1">
                {errors.endTime}
              </span>
            )}
          </div>
        </div>
      </div>

      {children}
    </div>
  );
};

export default EventDateTimeSection;
