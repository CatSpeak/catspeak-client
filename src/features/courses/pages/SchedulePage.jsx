import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useTimezone } from "@/shared/hooks/useTimezone";
import { getLocalizedLanguageName } from "../data/courseFormOptions";
import {
  useGetAllClassesQuery,
  useGetScheduleSessionsQuery,
} from "@/store/api/coursesApi";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar,
  Grid,
  CalendarDays,
  Plus,
  ArrowRight,
  Users,
} from "lucide-react";

import { toLocalDateString } from "../utils/dateUtils";
import { Breadcrumb } from "@/shared/components/ui/navigation";

const SchedulePage = () => {
  const { t } = useLanguage();
  const { formatDate, formatDateMonth, formatScheduleTime, getZoneDateStr } = useTimezone();
  const c = t.courses || {};
  const ui = c.workspaceUi || {};
  const navigate = useNavigate();

  // Local State
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState("calendar"); // "calendar" or "grid"

  // Helper arrays for calendar from localization
  const MONTHS = c.months || [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const DAYS_OF_WEEK = c.weekdays || [
    "MON",
    "TUE",
    "WED",
    "THU",
    "FRI",
    "SAT",
    "SUN",
  ];

  // Calendar Calculations
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  let startDayOfWeek = firstDayOfMonth.getDay();
  // Adjust day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday) to (0 = Mon, ..., 6 = Sun)
  startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = useMemo(() => {
    const arr = [];
    // Leading empty slots
    for (let i = 0; i < startDayOfWeek; i++) {
      arr.push(null);
    }
    // Days of month
    for (let d = 1; d <= daysInMonth; d++) {
      arr.push(new Date(year, month, d));
    }
    return arr;
  }, [year, month, startDayOfWeek, daysInMonth]);

  // Navigate Months
  const handlePrevMonth = () => {
    const previousMonth = new Date(year, month - 1, 1);
    setCurrentMonth(previousMonth);
    setSelectedDate(previousMonth);
  };
  const handleNextMonth = () => {
    const nextMonth = new Date(year, month + 1, 1);
    setCurrentMonth(nextMonth);
    setSelectedDate(nextMonth);
  };

  // Check state helpers
  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date) => {
    if (!date) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  // YYYY-MM-DD Date Queries computed values
  const startOfMonthStr = useMemo(() => {
    const d = new Date(year, month, 1);
    return toLocalDateString(d);
  }, [year, month]);

  const endOfMonthStr = useMemo(() => {
    const d = new Date(year, month + 1, 0);
    return toLocalDateString(d);
  }, [year, month]);

  const selectedDateStr = useMemo(() => {
    return toLocalDateString(selectedDate);
  }, [selectedDate]);

  // RTK Query endpoints integration
  const {
    currentData: classesData,
    isLoading: isClassesLoading,
    isFetching: isClassesFetching,
    error: classesError,
    refetch: refetchClasses,
  } = useGetAllClassesQuery({ page: 1, pageSize: 100 });
  const {
    currentData: scheduleSessionsData,
    isLoading: isSessionsLoading,
    isFetching: isSessionsFetching,
    error: sessionsError,
    refetch: refetchSessions,
  } = useGetScheduleSessionsQuery({
    from: startOfMonthStr,
    to: endOfMonthStr,
  });

  const classesList = useMemo(
    () =>
      Array.isArray(classesData?.data)
        ? classesData.data.filter(
          (item) =>
            item !== null &&
            typeof item === "object" &&
            !Array.isArray(item) &&
            item.id,
        )
        : [],
    [classesData],
  );
  const monthSessions = useMemo(
    () =>
      Array.isArray(scheduleSessionsData?.data)
        ? scheduleSessionsData.data.filter(
          (session) =>
            session !== null &&
            typeof session === "object" &&
            !Array.isArray(session),
        )
        : [],
    [scheduleSessionsData],
  );

  const monthSessionsWithZoneDate = useMemo(() => {
    return monthSessions.map((session) => {
      const zoneDate = getZoneDateStr(session.date, session.startTime);
      const formattedStart = formatScheduleTime(session.startTime, session.date);
      const formattedEnd = formatScheduleTime(session.endTime, session.date);

      return {
        ...session,
        zoneDate: zoneDate || session.date,
        formattedStart: formattedStart || session.startTime,
        formattedEnd: formattedEnd || session.endTime,
      };
    });
  }, [monthSessions, formatScheduleTime, getZoneDateStr]);

  const classesById = useMemo(
    () => new Map(classesList.map((item) => [String(item.id), item])),
    [classesList],
  );
  const sessionDateSet = useMemo(
    () =>
      new Set(
        monthSessionsWithZoneDate
          .map((session) => session.zoneDate)
          .filter(Boolean),
      ),
    [monthSessionsWithZoneDate],
  );
  const isLoading =
    isClassesLoading ||
    isSessionsLoading ||
    (isClassesFetching && classesData === undefined) ||
    (isSessionsFetching && scheduleSessionsData === undefined);

  // Map schedule sessions and enrich with metadata from classesList (levels, slots, studentCount)
  const selectedDateClasses = useMemo(() => {
    return monthSessionsWithZoneDate
      .filter(
        (session) => viewMode === "grid" || session.zoneDate === selectedDateStr,
      )
      .map((session) => {
        const matchedClass = classesById.get(String(session.class?.id));
        return {
          id: session.class?.id,
          name: session.class?.name || matchedClass?.name || "",
          language: session.class?.language || matchedClass?.language || "",
          levels: Array.isArray(matchedClass?.levels)
            ? matchedClass.levels
            : [],
          status: session.class?.status || matchedClass?.status || "",
          startTime: session.formattedStart,
          endTime: session.formattedEnd,
          sessionNumber: session.sessionNumber,
          totalSessions: session.totalSessions,
          date: session.zoneDate,
          studentCount: matchedClass?.studentCount ?? null,
          slots: matchedClass?.slots ?? null,
          startDate: matchedClass?.startDate,
        };
      });
  }, [classesById, monthSessionsWithZoneDate, selectedDateStr, viewMode]);

  // Count active dates with sessions in current month
  const monthClassesCount = sessionDateSet.size;
  const isRefreshing = isClassesFetching || isSessionsFetching;

  return (
    <div className="flex flex-col gap-6 text-[#2e2e2e] dark:text-gray-200">
      {isRefreshing && !isLoading && (
        <span role="status" className="sr-only">
          {c.refreshingSchedule || "Refreshing teaching schedule"}
        </span>
      )}

      {/* ─── Header ─── */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-gray-950 dark:text-white tracking-tight">
          {c.teachingSchedule || "Teaching Schedule"}
        </h1>
      </div>

      {/* ─── Upcoming Section bar ─── */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-5 border border-border dark:border-[#3F3F3F] shadow-sm flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 bg-[#990011] dark:bg-[#FF6B6B] rounded-full" />
            <h2 className="text-sm font-extrabold text-gray-800 dark:text-gray-200 uppercase tracking-wider flex items-center gap-2">
              <span>{c.upcomingSchedule || "Upcoming Schedule"}</span>
              <span className="bg-[#F59E0B] text-white text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center">
                {String(monthClassesCount)}
              </span>
            </h2>
          </div>
        </div>

        {/* ─── Split Columns Layout ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Calendar selector (Span 5 of 12) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="border border-border dark:border-[#3F3F3F] bg-[#FDFDFD] dark:bg-[#222222] rounded-2xl p-5 flex flex-col gap-5">
              {/* Month Selector header */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    aria-label={c.previousMonth || "Previous month"}
                    onClick={handlePrevMonth}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#2A2A2A] rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="text-sm font-extrabold text-gray-800 dark:text-gray-100">
                    {`${MONTHS[month]} ${year}`}
                  </span>
                  <button
                    type="button"
                    aria-label={c.nextMonth || "Next month"}
                    onClick={handleNextMonth}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#2A2A2A] rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>

                {/* View Mode controls */}
                <div className="flex bg-gray-100 dark:bg-[#2A2A2A] p-0.5 rounded-lg">
                  <button
                    type="button"
                    aria-label={c.calendarView || "Selected-date view"}
                    aria-pressed={viewMode === "calendar"}
                    onClick={() => setViewMode("calendar")}
                    className={`p-1.5 rounded-md transition-all ${viewMode === "calendar" ? "bg-white dark:bg-[#333333] text-[#990011] dark:text-[#FF6B6B] shadow-xs" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`}
                  >
                    <CalendarDays size={14} />
                  </button>
                  <button
                    type="button"
                    aria-label={c.monthGridView || "Whole-month view"}
                    aria-pressed={viewMode === "grid"}
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-white dark:bg-[#333333] text-[#990011] dark:text-[#FF6B6B] shadow-xs" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`}
                  >
                    <Grid size={14} />
                  </button>
                </div>
              </div>

              {/* Month Grid */}
              <div className="grid grid-cols-7 text-center gap-y-2.5 gap-x-1.5">
                {/* Weekday labels */}
                {DAYS_OF_WEEK.map((day, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider py-1"
                  >
                    {day}
                  </span>
                ))}

                {/* Day numbers */}
                {calendarDays.map((date, idx) => {
                  if (!date) return <div key={idx} className="aspect-square" />;

                  const hasClasses = sessionDateSet.has(
                    toLocalDateString(date),
                  );
                  const active = isSelected(date);
                  const today = isToday(date);

                  return (
                    <button
                      type="button"
                      aria-label={formatDate(date)}
                      aria-pressed={active}
                      key={idx}
                      onClick={() => setSelectedDate(date)}
                      className={`relative aspect-square flex items-center justify-center font-bold rounded-full transition-all duration-200 select-none
                        ${active
                          ? "bg-[#990011] dark:bg-[#FF6B6B] text-white dark:text-[#1A1A1A] shadow-sm hover:bg-[#80000e] dark:hover:bg-[#ff8585]"
                          : today
                            ? "border border-[#990011] dark:border-[#FF6B6B] text-[#990011] dark:text-[#FF6B6B] hover:bg-red-50/30 dark:hover:bg-[#FF6B6B]/10"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2A2A2A]"
                        }
                      `}
                    >
                      <span>{date.getDate()}</span>

                      {/* Class indicator dot */}
                      {hasClasses && !active && (
                        <span
                          className={`absolute bottom-1 w-1 h-1 rounded-full ${today ? "bg-[#990011] dark:bg-[#FF6B6B]" : "bg-gray-400 dark:bg-gray-500"}`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Calendar Legends */}
              <div className="flex items-center gap-6 pt-4 border-t border-gray-100 dark:border-[#333333] text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full border border-[#990011] dark:border-[#FF6B6B] flex items-center justify-center text-[9px] text-[#990011] dark:text-[#FF6B6B] font-bold">
                    18
                  </div>
                  <span>{c.today || "Today"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#990011] dark:bg-[#FF6B6B] flex items-center justify-center text-[9px] text-white dark:text-[#1A1A1A] font-bold">
                    20
                  </div>
                  <span>{c.selectedDate || "Selected Date"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Classes Scheduled (Span 7 of 12) */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            <h3 className="text-sm font-extrabold text-gray-800 dark:text-gray-200 uppercase tracking-wider flex items-center gap-2 pb-1 border-b border-border dark:border-[#3F3F3F]">
              <span>{c.teachingSchedule || "My Schedule"}</span>
            </h3>

            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#990011] dark:border-[#FF6B6B]"></div>
              </div>
            ) : classesError || sessionsError ? (
              <div
                role="alert"
                className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 p-4 rounded-xl text-sm font-semibold flex flex-col items-start gap-3"
              >
                <span>
                  {c.scheduleLoadError ||
                    "Failed to load the teaching schedule."}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    refetchClasses();
                    refetchSessions();
                  }}
                  className="rounded-xl bg-[#990011] dark:bg-[#FF6B6B] hover:bg-[#80000e] dark:hover:bg-[#ff8585] px-4 py-2 text-xs font-bold text-white dark:text-[#1A1A1A]"
                >
                  {c.retry || "Try again"}
                </button>
              </div>
            ) : selectedDateClasses.length > 0 ? (
              <div className="flex flex-col gap-4">
                <span className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {viewMode === "grid"
                    ? `${MONTHS[month]} ${year}`
                    : `${c.date || "Date"} ${formatDateMonth(selectedDate)}`}
                </span>

                {selectedDateClasses.map((cls) => {
                  const scheduleTime =
                    cls.startTime && cls.endTime
                      ? `${cls.startTime} - ${cls.endTime}`
                      : ui.tba || "TBA";

                  return (
                    <div
                      key={`${cls.id || "class"}-${cls.date || selectedDateStr}-${cls.sessionNumber || cls.startTime || "session"}`}
                      onClick={() => {
                        if (cls.id) {
                          navigate(
                            `/workspace/courses/class/${encodeURIComponent(String(cls.id))}`,
                          );
                        }
                      }}
                      className="bg-[#FDFDFD] dark:bg-[#222222] border border-border dark:border-[#3F3F3F] hover:border-gray-300 dark:hover:border-gray-600 rounded-2xl p-5 flex flex-col gap-3 shadow-xs hover:shadow-sm transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex justify-between items-start">
                        {/* Pills */}
                        <div className="flex flex-wrap gap-1.5">
                          {cls.language && (
                            <span className="bg-[#F59E0B] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                              {getLocalizedLanguageName(cls.language, t)}
                            </span>
                          )}
                          {cls.levels &&
                            cls.levels.map((lvl, index) => (
                              <span
                                key={index}
                                className="bg-amber-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-md uppercase"
                              >
                                {lvl}
                              </span>
                            ))}
                        </div>

                        {/* Status badge */}
                        <div>
                          {cls.status === "LIVE" && (
                            <span className="bg-[#FFE4E6] dark:bg-[#E11D48]/20 text-[#E11D48] dark:text-[#FDA4AF] font-bold text-[9px] px-2 py-0.5 rounded-md flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-[#E11D48] animate-ping" />
                              {c.liveStatus || "Live"}
                            </span>
                          )}
                          {cls.status === "TEACHING" && (
                            <span className="bg-[#E8F8F0] dark:bg-[#15803D]/20 text-[#15803D] dark:text-[#86EFAC] font-bold text-[9px] px-2 py-0.5 rounded-md">
                              {c.teachingStatus || "Teaching"}
                            </span>
                          )}
                          {cls.status === "NOT_STARTED" && (
                            <span className="bg-[#FEF3C7] dark:bg-[#D97706]/20 text-[#D97706] dark:text-[#FDE68A] font-bold text-[9px] px-2 py-0.5 rounded-md">
                              {c.notStartedStatus || "Not started"}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Class Title */}
                      <h4 className="font-extrabold text-[#1f2937] dark:text-white text-base leading-snug">
                        {cls.name}
                      </h4>

                      {/* Schedule info under title */}
                      <div className="flex flex-col gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <Clock size={13} className="text-gray-400 dark:text-gray-500" />
                          <span>{scheduleTime}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-gray-400 dark:text-gray-500" />
                          <span>
                            {cls.sessionNumber && cls.totalSessions
                              ? c.sessionOf
                                ? c.sessionOf
                                  .replace("{{session}}", cls.sessionNumber)
                                  .replace("{{total}}", cls.totalSessions)
                                : `Session ${cls.sessionNumber} of ${cls.totalSessions}`
                              : formatDate(cls.date || cls.startDate)}
                          </span>
                        </div>
                      </div>

                      {/* Bottom Info: Avatars and action */}
                      <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-[#333333] mt-1">
                        <div className="flex items-center gap-2">
                          <Users
                            size={15}
                            className="text-gray-400 dark:text-gray-500"
                            aria-hidden="true"
                          />
                          <span className="text-[10px] text-gray-400 dark:text-gray-400 font-bold">
                            {cls.studentCount == null
                              ? "—"
                              : (
                                c.studentsCount || "{{count}} students"
                              ).replace(
                                "{{count}}",
                                String(cls.studentCount),
                              )}
                          </span>
                        </div>

                        <button
                          type="button"
                          disabled={!cls.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (cls.id) {
                              navigate(
                                `/workspace/courses/class/${encodeURIComponent(String(cls.id))}`,
                              );
                            }
                          }}
                          className="bg-[#990011] hover:bg-[#80000e] dark:bg-[#FF6B6B] dark:hover:bg-[#ff8585] text-white dark:text-[#1A1A1A] text-[11px] font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 transition-all active:scale-95 shadow-xs"
                        >
                          <span>{c.viewClass || "View Class"}</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-xs font-semibold text-gray-400 dark:text-gray-500 border border-dashed border-border dark:border-[#3F3F3F] rounded-2xl bg-gray-50/50 dark:bg-[#222222]/50">
                {c.noClassesOnDate || "No classes scheduled for this date"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;
