/**
 * Calendar constants shared across calendar components.
 */

/** Array of 24 hours (0-23) for time grid rendering */
export const HOURS = Array.from({ length: 24 }, (_, i) => i)

/** Week day keys in Monday-first order (for week view header) */
export const WEEK_DAY_KEYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

/** Day name mapping indexed by dayjs().day() (0=Sunday) */
export const DAY_NAME_MAP = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

/** Event type keys */
export const EVENT_TYPE_KEYS = {
  TEACHING_SCHEDULE: 'teaching-schedule',
  STUDENT_SCHEDULE: 'student-schedule',
  MY_EVENT: 'my-event',
  REGISTERED_EVENT: 'registered-event',
  OTHER: 'other',
}

/** Event type color mapping (key → hex color) */
export const EVENT_TYPE_COLORS = {
  [EVENT_TYPE_KEYS.TEACHING_SCHEDULE]: '#34ce56',
  [EVENT_TYPE_KEYS.STUDENT_SCHEDULE]: '#0e6eec',
  [EVENT_TYPE_KEYS.MY_EVENT]: '#f83b4f',
  [EVENT_TYPE_KEYS.REGISTERED_EVENT]: '#e2b60a',
  [EVENT_TYPE_KEYS.OTHER]: '#888888',
}

/** Default filter state used across EventFilter & MyCalendarPage */
export const DEFAULT_FILTERS = {
  eventTypes: [
    EVENT_TYPE_KEYS.TEACHING_SCHEDULE,
    EVENT_TYPE_KEYS.STUDENT_SCHEDULE,
    EVENT_TYPE_KEYS.MY_EVENT,
    EVENT_TYPE_KEYS.REGISTERED_EVENT,
    EVENT_TYPE_KEYS.OTHER,
  ],
  classIds: [],
}

/**
 * Build event type options for filter & legend.
 * @param {object} t - Translation object from useLanguage
 * @param {boolean} isTeacher - Whether user is a teacher
 * @returns {Array<{key: string, label: string, color: string}>}
 */
export const getEventTypeOptions = (t, isTeacher) => [
  ...(isTeacher ? [{ key: EVENT_TYPE_KEYS.TEACHING_SCHEDULE, label: t.calendar?.teachingSchedule || 'Lịch dạy', color: EVENT_TYPE_COLORS[EVENT_TYPE_KEYS.TEACHING_SCHEDULE] }] : []),
  { key: EVENT_TYPE_KEYS.STUDENT_SCHEDULE, label: t.calendar?.studentSchedule || 'Lịch học', color: EVENT_TYPE_COLORS[EVENT_TYPE_KEYS.STUDENT_SCHEDULE] },
  ...(isTeacher ? [{ key: EVENT_TYPE_KEYS.MY_EVENT, label: t.calendar?.myEvents || 'Sự kiện của tôi', color: EVENT_TYPE_COLORS[EVENT_TYPE_KEYS.MY_EVENT] }] : []),
  { key: EVENT_TYPE_KEYS.REGISTERED_EVENT, label: t.calendar?.registered || 'Đã đăng ký', color: EVENT_TYPE_COLORS[EVENT_TYPE_KEYS.REGISTERED_EVENT] },
  { key: EVENT_TYPE_KEYS.OTHER, label: t.calendar?.other || 'Khác', color: EVENT_TYPE_COLORS[EVENT_TYPE_KEYS.OTHER] },
]
