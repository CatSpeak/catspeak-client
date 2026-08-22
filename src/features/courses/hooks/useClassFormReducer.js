import { useReducer, useMemo, useEffect, useCallback, useRef } from "react"
import {
  COURSE_FORM_LANGUAGES,
  DEFAULT_CLASS_FEE_TIERS,
  getLevelsForLanguage,
} from "../data/courseFormOptions"
import {
  calculateFees,
  formatCurrency,
  formatToYYYYMMDD,
  getSafeMediaUrl,
} from "../utils/courseUtils"
import { convertTimeStrToTz, getShiftedDayOfWeek } from "@/shared/utils/dateUtils"
import { useTimezone } from "@/shared/hooks/useTimezone"

// ─── Defaults ───

const createDefaultCheckedDays = () => ({
  monday: true,
  tuesday: false,
  wednesday: true,
  thursday: false,
  friday: true,
  saturday: false,
  sunday: false,
})

const createDefaultTimeSlots = () => ({
  monday: { start: "18:00", end: "19:30" },
  tuesday: { start: "18:00", end: "19:30" },
  wednesday: { start: "18:00", end: "19:30" },
  thursday: { start: "18:00", end: "19:30" },
  friday: { start: "18:00", end: "19:30" },
  saturday: { start: "18:00", end: "19:30" },
  sunday: { start: "18:00", end: "19:30" },
})

const createInitialState = (initialCourseId) => ({
  courseId: initialCourseId || "",
  className: "",
  selectedLanguage: "English",
  level: "A1",
  admissionStart: "",
  admissionStartHours: "",
  admissionEnd: "",
  admissionEndHours: "",
  startDate: "",
  startDateHours: "",
  sessions: 24,
  capacity: 6,
  description: "",
  fee: "850000",
  requireMinimumAttendance: true,
  requireMinAttendance: true,
  minimumAttendanceRate: 80,
  minAttendanceRate: 80,
  lateAttendancePolicy: "CountLate",
  includeLateAttendance: true,
  thumbnailFile: null,
  thumbnailPreview: "",
  checkedDays: createDefaultCheckedDays(),
  timeSlots: createDefaultTimeSlots(),
  errors: {},
  showDeleteModal: false,
})

// ─── Schedule Parsing ───

const API_DAYS_TO_LOCAL_KEYS = {
  MON: "monday",
  TUE: "tuesday",
  WED: "wednesday",
  THU: "thursday",
  FRI: "friday",
  SAT: "saturday",
  SUN: "sunday",
}

function parseScheduleFromApi(cls, userTimeZone = null) {
  const checkedDays = {
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  }
  const timeSlots = createDefaultTimeSlots()

  if (!cls.schedule && !cls.rawSchedule) return { checkedDays, timeSlots }

  const scheduleEntries = Array.isArray(cls.rawSchedule)
    ? cls.rawSchedule
    : (Array.isArray(cls.schedule) ? cls.schedule : [])
  const days = cls.schedule?.days || scheduleEntries.map((s) => s.dayOfWeek)
  const startTime = cls.schedule?.startTime || scheduleEntries[0]?.startTime || ""
  const endTime = cls.schedule?.endTime || scheduleEntries[0]?.endTime || ""

  if (scheduleEntries.length > 0) {
    scheduleEntries.forEach((item) => {
      const shiftedDay = getShiftedDayOfWeek(item.dayOfWeek, item.startTime, userTimeZone, "UTC")
      const key = API_DAYS_TO_LOCAL_KEYS[shiftedDay] || API_DAYS_TO_LOCAL_KEYS[item.dayOfWeek]
      if (key) {
        checkedDays[key] = true
        timeSlots[key] = {
          start: convertTimeStrToTz(item.startTime, userTimeZone, "UTC") || item.startTime || "",
          end: convertTimeStrToTz(item.endTime, userTimeZone, "UTC") || item.endTime || "",
        }
      }
    })
  } else if (days) {
    days.forEach((day) => {
      const shiftedDay = getShiftedDayOfWeek(day, startTime, userTimeZone, "UTC")
      const key = API_DAYS_TO_LOCAL_KEYS[shiftedDay] || API_DAYS_TO_LOCAL_KEYS[day]
      if (key) {
        checkedDays[key] = true
        timeSlots[key] = {
          start: convertTimeStrToTz(startTime, userTimeZone, "UTC") || startTime || "",
          end: convertTimeStrToTz(endTime, userTimeZone, "UTC") || endTime || "",
        }
      }
    })
  }

  return { checkedDays, timeSlots }
}

// ─── Reducer ───

function classFormReducer(state, action) {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value }

    case "SET_ERRORS":
      return { ...state, errors: action.errors }

    case "CLEAR_ERROR":
      if (!state.errors[action.field]) return state
      return { ...state, errors: { ...state.errors, [action.field]: false } }

    case "RESET_FORM":
      return createInitialState(action.initialCourseId)

    case "HYDRATE_FROM_CLASS": {
      const {
        cls,
        userTimeZone,
        admissionStart,
        admissionStartHours,
        admissionEnd,
        admissionEndHours,
        startDate,
        startDateHours,
      } = action
      const { checkedDays, timeSlots } = parseScheduleFromApi(cls, userTimeZone)
      return {
        ...state,
        courseId: cls.courseId || "",
        className: cls.name || cls.title || "",
        selectedLanguage: cls.language || "",
        level: cls.levels?.[0] || "",
        admissionStart,
        admissionStartHours,
        admissionEnd,
        admissionEndHours,
        startDate,
        startDateHours,
        sessions: cls.totalSessions ?? "",
        capacity: cls.slots ?? "",
        description: cls.description || "",
        fee: cls.tuitionFee?.toString() || "",
        requireMinimumAttendance: cls.requireMinimumAttendance ?? cls.requireMinAttendance ?? true,
        requireMinAttendance: cls.requireMinimumAttendance ?? cls.requireMinAttendance ?? true,
        minimumAttendanceRate: cls.minimumAttendanceRate ?? cls.minAttendanceRate ?? 80,
        minAttendanceRate: cls.minimumAttendanceRate ?? cls.minAttendanceRate ?? 80,
        lateAttendancePolicy: cls.lateAttendancePolicy || (cls.includeLateAttendance === false ? "IgnoreLate" : "CountLate"),
        includeLateAttendance: cls.lateAttendancePolicy ? (cls.lateAttendancePolicy === "CountLate") : (cls.includeLateAttendance ?? true),
        thumbnailFile: null,
        thumbnailPreview: cls.thumbnailUrl
          ? (getSafeMediaUrl(cls.thumbnailUrl) || "")
          : "",
        checkedDays,
        timeSlots,
        errors: {},
      }
    }

    case "SELECT_COURSE": {
      const { courseId, course, languagesList } = action
      if (!course) {
        return {
          ...state,
          courseId,
          errors: { ...state.errors, courseId: false },
        }
      }

      const updates = {
        courseId,
        admissionStart: formatToYYYYMMDD(course.enrollmentStart),
        admissionEnd: formatToYYYYMMDD(course.enrollmentEnd),
        errors: { ...state.errors, courseId: false },
      }

      if (course.language) {
        const matchedLang = languagesList.find(
          (l) => (l.name || "").toLowerCase() === course.language.toLowerCase()
        )
        updates.selectedLanguage = matchedLang
          ? matchedLang.name
          : course.language
        updates.errors = { ...updates.errors, selectedLanguage: false }
      }

      if (
        Array.isArray(course.levels) &&
        course.levels.length > 0
      ) {
        const firstLevel = course.levels[0]
        const rawLevel =
          typeof firstLevel === "object" ? firstLevel.name : firstLevel
        if (rawLevel) {
          updates.level = rawLevel
          updates.errors = { ...updates.errors, level: false }
        }
      }

      if (course.totalSessions) {
        updates.sessions = parseInt(course.totalSessions, 10) || 24
        updates.errors = { ...updates.errors, sessions: false }
      }

      return { ...state, ...updates }
    }

    case "TOGGLE_DAY":
      return {
        ...state,
        checkedDays: {
          ...state.checkedDays,
          [action.day]: !state.checkedDays[action.day],
        },
        errors: { ...state.errors, checkedDays: false },
      }

    case "SET_TIME_SLOT":
      return {
        ...state,
        timeSlots: {
          ...state.timeSlots,
          [action.day]: {
            ...state.timeSlots[action.day],
            [action.field]: action.value,
          },
        },
      }

    case "ENFORCE_MIN_FEE": {
      const currentFeeNum =
        parseFloat(state.fee.replace(/[^0-9]/g, "")) || 0
      if (currentFeeNum < action.minFee) {
        return { ...state, fee: action.minFee.toString() }
      }
      return state
    }

    default:
      return state
  }
}

// ─── Hook ───

export function useClassFormReducer({
  formInstanceKey,
  initialCourseId,
  isEditMode,
  isRecoverMode,
  coursesList,
  languagesList,
  classDetailResponse,
  recoverClassResponse,
  onFormInstanceChange,
  toastError,
}) {
  const { userTimeZone, getZoneDateStr, formatTime } = useTimezone()
  const [state, dispatch] = useReducer(
    classFormReducer,
    initialCourseId,
    createInitialState
  )

  const previousFormInstanceKeyRef = useRef(null)
  const hydratedDetailsKeyRef = useRef(null)
  const appliedInitialCourseKeyRef = useRef(null)
  const thumbnailReaderRef = useRef(null)

  // Stable callback refs — avoids re-triggering effects when callers
  // rebuild callbacks on every render.
  const onFormInstanceChangeRef = useRef(onFormInstanceChange)
  const toastErrorRef = useRef(toastError)

  useEffect(() => {
    onFormInstanceChangeRef.current = onFormInstanceChange
  }, [onFormInstanceChange])

  useEffect(() => {
    toastErrorRef.current = toastError
  }, [toastError])

  // ─── Cleanup on unmount ───
  useEffect(() => {
    return () => {
      thumbnailReaderRef.current?.abort()
    }
  }, [])

  // ─── Reset form when formInstanceKey changes ───
  useEffect(() => {
    if (previousFormInstanceKeyRef.current === formInstanceKey) return

    previousFormInstanceKeyRef.current = formInstanceKey
    hydratedDetailsKeyRef.current = null
    appliedInitialCourseKeyRef.current = null
    thumbnailReaderRef.current?.abort()
    thumbnailReaderRef.current = null

    dispatch({ type: "RESET_FORM", initialCourseId })
    onFormInstanceChangeRef.current?.()
  }, [formInstanceKey, initialCourseId])

  // ─── Derived values ───
  const minFee = useMemo(() => {
    return (
      50000 * (parseInt(state.capacity, 10) || 0) +
      25000 * (parseInt(state.sessions, 10) || 0)
    )
  }, [state.capacity, state.sessions])

  // ─── Auto min-fee enforcement (create mode only) ───
  useEffect(() => {
    if (isEditMode || isRecoverMode) return
    dispatch({ type: "ENFORCE_MIN_FEE", minFee })
  }, [minFee, isEditMode, isRecoverMode])

  const selectedCourse = useMemo(
    () => coursesList.find((c) => String(c.id) === String(state.courseId)),
    [coursesList, state.courseId]
  )

  const levelsList = useMemo(() => {
    // 1. If selected course has levels defined
    if (
      selectedCourse &&
      Array.isArray(selectedCourse.levels) &&
      selectedCourse.levels.length > 0
    ) {
      return selectedCourse.levels.map((lvl, index) => {
        if (typeof lvl === "object" && lvl !== null) {
          return { id: lvl.id || index + 1, name: lvl.name || String(lvl) }
        }
        return { id: index + 1, name: String(lvl) }
      })
    }

    // 2. Look up language in languagesList or COURSE_FORM_LANGUAGES
    const normLang = (state.selectedLanguage || "").trim().toLowerCase()
    if (normLang) {
      const matched =
        languagesList.find(
          (l) => (l.name || "").trim().toLowerCase() === normLang
        ) ||
        COURSE_FORM_LANGUAGES.find(
          (l) => (l.name || "").trim().toLowerCase() === normLang
        )

      if (
        matched &&
        Array.isArray(matched.levels) &&
        matched.levels.length > 0
      ) {
        return matched.levels
      }
    }

    // 3. Fallback using centralized helper
    return getLevelsForLanguage(state.selectedLanguage)
  }, [selectedCourse, state.selectedLanguage, languagesList])

  const editingClassData = useMemo(() => {
    if (!isEditMode) return null
    const responseData = classDetailResponse?.data || classDetailResponse
    if (
      !responseData ||
      typeof responseData !== "object" ||
      Array.isArray(responseData)
    )
      return null
    return responseData
  }, [isEditMode, classDetailResponse])

  const feeNum = parseFloat(state.fee.replace(/[^0-9]/g, "")) || 0

  const feeDetails = useMemo(() => {
    return calculateFees(state.capacity, feeNum, DEFAULT_CLASS_FEE_TIERS)
  }, [feeNum, state.capacity])

  const amountReceived = formatCurrency(feeDetails.netPerStudent)

  // ─── Auto-fill from initial course ───
  const handleCourseChange = useCallback(
    (id) => {
      const course = coursesList.find(
        (c) => String(c.id) === String(id)
      )
      dispatch({
        type: "SELECT_COURSE",
        courseId: id,
        course,
        languagesList,
      })
    },
    [coursesList, languagesList]
  )

  useEffect(() => {
    if (
      !isEditMode &&
      !isRecoverMode &&
      initialCourseId &&
      coursesList.length > 0 &&
      appliedInitialCourseKeyRef.current !== formInstanceKey
    ) {
      appliedInitialCourseKeyRef.current = formInstanceKey
      handleCourseChange(initialCourseId)
    }
  }, [
    formInstanceKey,
    initialCourseId,
    coursesList,
    handleCourseChange,
    isEditMode,
    isRecoverMode,
  ])

  // ─── Hydrate from class detail (edit/recover) ───
  useEffect(() => {
    const responseData = isEditMode
      ? classDetailResponse
      : isRecoverMode
        ? recoverClassResponse
        : null
    if (
      responseData &&
      hydratedDetailsKeyRef.current !== formInstanceKey
    ) {
      const cls = responseData.data || responseData
      if (
        !cls ||
        typeof cls !== "object" ||
        Array.isArray(cls) ||
        !cls.id
      ) {
        return
      }

      hydratedDetailsKeyRef.current = formInstanceKey
      thumbnailReaderRef.current?.abort()
      thumbnailReaderRef.current = null
      dispatch({
        type: "HYDRATE_FROM_CLASS",
        cls,
        userTimeZone,
        admissionStart: getZoneDateStr(cls.enrollmentStart),
        admissionStartHours: cls.enrollmentStart ? formatTime(cls.enrollmentStart) : "",
        admissionEnd: getZoneDateStr(cls.enrollmentEnd),
        admissionEndHours: cls.enrollmentEnd ? formatTime(cls.enrollmentEnd) : "",
        startDate: getZoneDateStr(cls.startDate),
        startDateHours: cls.startDate ? formatTime(cls.startDate) : "",
      })
    }
  }, [
    classDetailResponse,
    formInstanceKey,
    recoverClassResponse,
    isEditMode,
    isRecoverMode,
    userTimeZone,
  ])

  // ─── Handlers ───
  const clearError = useCallback((field) => {
    dispatch({ type: "CLEAR_ERROR", field })
  }, [])

  const setField = useCallback((field, value) => {
    dispatch({ type: "SET_FIELD", field, value })
  }, [])

  const handleToggleDay = useCallback((day) => {
    dispatch({ type: "TOGGLE_DAY", day })
  }, [])

  const handleTimeChange = useCallback((day, field, value) => {
    dispatch({ type: "SET_TIME_SLOT", day, field, value })
  }, [])

  const handleThumbnailFileChange = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toastErrorRef.current?.("invalidImage")
      e.target.value = ""
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toastErrorRef.current?.("fileTooLarge")
      e.target.value = ""
      return
    }

    dispatch({ type: "SET_FIELD", field: "thumbnailFile", value: file })
    thumbnailReaderRef.current?.abort()
    const reader = new FileReader()
    thumbnailReaderRef.current = reader
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        dispatch({
          type: "SET_FIELD",
          field: "thumbnailPreview",
          value: reader.result,
        })
      }
      thumbnailReaderRef.current = null
    }
    reader.onerror = () => {
      thumbnailReaderRef.current = null
      toastErrorRef.current?.("imageReadFail")
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }, [])

  const formatFeeInput = useCallback((val) => {
    const cleaned = val.replace(/[^0-9]/g, "")
    dispatch({ type: "SET_FIELD", field: "fee", value: cleaned })
  }, [])

  return {
    state,
    dispatch,

    // Handlers
    handleCourseChange,
    handleToggleDay,
    handleTimeChange,
    handleThumbnailFileChange,
    formatFeeInput,
    clearError,
    setField,

    // Derived values
    minFee,
    levelsList,
    selectedCourse,
    editingClassData,
    feeDetails,
    feeNum,
    amountReceived,
  }
}
