import React, { useMemo, useRef, useEffect, useCallback } from "react"
import { useNavigate, useLocation, useParams } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { toast } from "react-hot-toast"
import { Editor } from "@tinymce/tinymce-react"
import {
  Plus,
  Minus,
  Info,
  ChevronDown,
  Upload,
  Trash2,
  ArrowLeft
} from "lucide-react"

import {
  useGetAllCoursesQuery,
  useCreateClassMutation,
  useGetClassDetailQuery,
  useUpdateClassMutation,
  useDeleteClassMutation
} from "@/store/api/coursesApi"
import { useGetInstructorProfileQuery } from "@/store/api/instructorApi"
import { DatePicker } from "@/shared/components/ui/inputs"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import Breadcrumb from "@/shared/components/ui/navigation/Breadcrumb"
import {
  getInstructorFormLanguages,
  getLocalizedLanguageName,
} from "../data/courseFormOptions"
import {
  formatCurrency,
  formatCurrencyVND,
  getSafeMediaUrl,
} from "../utils/courseUtils"
import { parseLocalDateString, toLocalDateString } from "../utils/dateUtils"

import { useClassFormReducer } from "../hooks/useClassFormReducer"

const DAYS_OF_WEEK = [
  { key: "monday", label: "Mon", code: "T2", fullName: "Monday" },
  { key: "tuesday", label: "Tue", code: "T3", fullName: "Tuesday" },
  { key: "wednesday", label: "Wed", code: "T4", fullName: "Wednesday" },
  { key: "thursday", label: "Thu", code: "T5", fullName: "Thursday" },
  { key: "friday", label: "Fri", code: "T6", fullName: "Friday" },
  { key: "saturday", label: "Sat", code: "T7", fullName: "Saturday" },
  { key: "sunday", label: "Sun", code: "CN", fullName: "Sunday" }
]

const CreateClassPage = () => {
  const { t } = useLanguage()
  const c = t.courses || {}
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id
  const location = useLocation()
  const routeSearchParams = new URLSearchParams(location.search)
  const recoverClassId = location.state?.recoverClassId || routeSearchParams.get("recoverClassId") || ""
  const isRecoverMode = !!recoverClassId
  const initialCourseId = location.state?.courseId || routeSearchParams.get("courseId") || ""
  const formInstanceKey = isEditMode
    ? `edit:${String(id)}`
    : isRecoverMode
      ? `recover:${String(recoverClassId)}`
      : `create:${String(initialCourseId)}`
  const fileInputRef = useRef(null)
  const activeFormInstanceKeyRef = useRef(formInstanceKey)
  const activeMutationRequestRef = useRef(null)
  const mountedRef = useRef(true)

  // Localizations
  const cc = c.createClass || {}

  const {
    currentData: coursesData,
    isLoading: isCoursesLoading,
    isFetching: isCoursesFetching,
    error: coursesError,
    refetch: refetchCourses,
  } = useGetAllCoursesQuery(
    { page: 1, pageSize: 100 },
    { skip: isEditMode || isRecoverMode }
  )
  const [createClass, { isLoading: isCreating }] = useCreateClassMutation()
  const [updateClass, { isLoading: isUpdating }] = useUpdateClassMutation()

  const {
    currentData: classDetailResponse,
    isLoading: isEditDetailsLoading,
    isFetching: isEditDetailsFetching,
    error: editDetailsError,
    refetch: refetchEditDetails,
  } = useGetClassDetailQuery(id, { skip: !isEditMode })
  const {
    currentData: recoverClassResponse,
    isLoading: isRecoverLoading,
    isFetching: isRecoverFetching,
    error: recoverDetailsError,
    refetch: refetchRecoverDetails,
  } = useGetClassDetailQuery(recoverClassId, { skip: !isRecoverMode })
  const isDetailsLoading = isEditMode
    ? (
      isEditDetailsLoading
      || (isEditDetailsFetching && classDetailResponse === undefined)
    )
    : (
      isRecoverMode
        ? (
          isRecoverLoading
          || (isRecoverFetching && recoverClassResponse === undefined)
        )
        : false
    )
  const [deleteClass, { isLoading: isDeleting }] = useDeleteClassMutation()

  const submitGuardRef = useRef(false)
  const deleteGuardRef = useRef(false)

  activeFormInstanceKeyRef.current = formInstanceKey

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      activeMutationRequestRef.current?.abort?.()
    }
  }, [])

  const { data: instructorProfileData } = useGetInstructorProfileQuery()
  const instructorProfile = instructorProfileData?.data || instructorProfileData

  const languagesList = useMemo(
    () => getInstructorFormLanguages(instructorProfile),
    [instructorProfile]
  )
  const coursesList = useMemo(
    () => (Array.isArray(coursesData?.data) ? coursesData.data : []),
    [coursesData],
  )
  const tomorrow = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const handleToastError = useCallback((key) => {
    const courses = t.courses || {}
    const createCls = courses.createClass || {}
    if (key === "invalidImage") toast.error(createCls.toastInvalidImage || "Choose a JPG, PNG, or WebP image.")
    else if (key === "fileTooLarge") toast.error(courses.avatarDesc2 || "File size must be under 50mb")
    else if (key === "imageReadFail") toast.error(createCls.toastImageReadFail || "The selected image could not be read.")
  }, [t.courses])

  const {
    state,
    handleCourseChange,
    handleToggleDay,
    handleTimeChange,
    handleThumbnailFileChange,
    formatFeeInput,
    clearError,
    setField,
    minFee,
    levelsList,
    editingClassData,
    feeDetails,
    feeNum,
    amountReceived,
  } = useClassFormReducer({
    formInstanceKey,
    initialCourseId,
    isEditMode,
    isRecoverMode,
    coursesList,
    languagesList,
    classDetailResponse,
    recoverClassResponse,
    onFormInstanceChange: () => {
      submitGuardRef.current = false
      deleteGuardRef.current = false
      activeMutationRequestRef.current?.abort?.()
      activeMutationRequestRef.current = null
    },
    toastError: handleToastError,
  })

  const {
    courseId,
    className,
    selectedLanguage,
    level,
    admissionStart,
    admissionEnd,
    startDate,
    sessions,
    capacity,
    description,
    fee,
    thumbnailFile,
    thumbnailPreview,
    checkedDays,
    timeSlots,
    errors,
    showDeleteModal,
  } = state

  const isLevelDisabled = useMemo(() => {
    if (!isEditMode || !editingClassData) return false

    // 1. Explicit backend lock flag
    if (editingClassData.isLevelLocked === true || editingClassData.levelsLocked === true) {
      return true
    }

    // 2. Someone already enrolled in the class
    const enrolledCount = Number(editingClassData.enrolledCount) || Number(editingClassData.enrolledStudentsCount) || Number(editingClassData.enrolled) || 0
    if (enrolledCount > 0) {
      return true
    }
    if (
      editingClassData.slots !== undefined &&
      editingClassData.remainingSlots !== undefined &&
      Number(editingClassData.remainingSlots) < Number(editingClassData.slots)
    ) {
      return true
    }

    const now = new Date()

    // 3. Class has started enrollment date (in enrollment date)
    if (editingClassData.enrollmentStart) {
      const startEn = new Date(editingClassData.enrollmentStart)
      if (!isNaN(startEn.getTime()) && startEn <= now) {
        return true
      }
    }

    // 4. Class has started start date
    if (editingClassData.startDate) {
      const startCls = new Date(editingClassData.startDate)
      if (!isNaN(startCls.getTime()) && startCls <= now) {
        return true
      }
    }

    return false
  }, [isEditMode, editingClassData])

  const setShowDeleteModal = useCallback((val) => {
    setField("showDeleteModal", val)
  }, [setField])

  const setErrors = useCallback((val) => {
    setField("errors", typeof val === "function" ? val(state.errors) : val)
  }, [setField, state.errors])

  const handleThumbnailClick = () => {
    fileInputRef.current?.click()
  }

  const labelCommissionNote = (cc.commissionNote || "The platform will withhold a {{commission}}% commission fee on each successful student enrollment.")
    .replace("{{commission}}", feeDetails.commissionRate)
    .replace("{{amount}}", formatCurrency(feeDetails.commissionPerStudent))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitGuardRef.current || isCreating || isUpdating) return

    const newErrors = {}
    if (!className.trim()) newErrors.className = true
    if (!selectedLanguage) newErrors.selectedLanguage = true
    if (!level) newErrors.level = true
    if (!admissionStart) newErrors.admissionStart = true
    if (!admissionEnd) newErrors.admissionEnd = true
    if (!startDate) newErrors.startDate = true

    const sessionCount = parseInt(sessions, 10) || 0
    const classCapacity = parseInt(capacity, 10) || 0
    if (!Number.isSafeInteger(sessionCount) || sessionCount <= 0) newErrors.sessions = true
    if (!Number.isSafeInteger(classCapacity) || classCapacity <= 0) newErrors.capacity = true

    const checkedDaysList = Object.keys(checkedDays).filter(k => checkedDays[k])
    if (checkedDaysList.length === 0) newErrors.checkedDays = true

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      if (newErrors.className) toast.error(cc.toastEnterClassName || "Please enter class name!")
      else if (newErrors.selectedLanguage) toast.error(cc.toastSelectLanguage || "Please select a language!")
      else if (newErrors.level) toast.error(cc.toastSelectLevel || "Please select a level!")
      else if (newErrors.admissionStart || newErrors.admissionEnd || newErrors.startDate) toast.error(cc.toastAdmissionAndStart || "Please enter admission period and start date!")
      else if (newErrors.sessions) toast.error(cc.toastEnterSessions || "Please enter valid number of sessions!")
      else if (newErrors.capacity) toast.error(cc.toastEnterCapacity || "Please enter valid class capacity!")
      else if (newErrors.checkedDays) toast.error(cc.toastSelectSchedule || "Please select at least one teaching day!")
      return
    }

    setErrors({})

    const start = parseLocalDateString(startDate)
    const enrollStart = parseLocalDateString(admissionStart)
    const enrollEnd = parseLocalDateString(admissionEnd)
    if (!start || !enrollStart || !enrollEnd) {
      toast.error(cc.toastInvalidDates || "Enter valid enrollment and class dates.")
      return
    }

    if (!isEditMode) {
      if (enrollStart && enrollStart < tomorrow) {
        toast.error(cc.toastAdmissionStartPast || "Admission start date must be from tomorrow onwards!")
        return
      }
      if (enrollEnd && enrollEnd < tomorrow) {
        toast.error(cc.toastAdmissionEndPast || "Admission end date must be from tomorrow onwards!")
        return
      }
      if (start && start < tomorrow) {
        toast.error(cc.toastStartPast || "Start date must be from tomorrow onwards!")
        return
      }
    }

    if (enrollStart && enrollEnd && enrollEnd <= enrollStart) {
      toast.error(cc.toastAdmissionEndLater || "Enrollment end date must be later than enrollment start date!")
      return
    }

    if (enrollEnd && start && start < enrollEnd) {
      toast.error(cc.toastStartLater || "Start date must be later than or equal to enrollment end date!")
      return
    }

    const feeNum = parseFloat(fee) || 0
    if (feeNum < minFee) {
      toast.error(
        (cc.minTuitionFeeNote || "Mức học phí tối thiểu cho cấu hình lớp học này là {{minFee}} VNĐ. Vui lòng điều chỉnh lại!")
          .replace("{{minFee}}", formatCurrency(minFee))
      )
      return
    }

    const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/
    const invalidScheduleDay = checkedDaysList.find((day) => {
      const slot = timeSlots[day]
      return (
        !timePattern.test(slot?.start || "")
        || !timePattern.test(slot?.end || "")
        || slot.start >= slot.end
      )
    })
    if (invalidScheduleDay) {
      toast.error(cc.toastInvalidScheduleTime || "Each class must end after it starts.")
      return
    }

    const daysCodeMap = {
      monday: "MON",
      tuesday: "TUE",
      wednesday: "WED",
      thursday: "THU",
      friday: "FRI",
      saturday: "SAT",
      sunday: "SUN"
    }
    const schedule = checkedDaysList.map(k => ({
      dayOfWeek: daysCodeMap[k],
      startTime: timeSlots[k].start,
      endTime: timeSlots[k].end
    }))

    submitGuardRef.current = true
    const submittedFormKey = formInstanceKey
    let request = null
    try {
      const originalLevels = (
        isEditMode
        && Array.isArray(editingClassData?.levels)
        && editingClassData.levels.length > 0
      )
        ? editingClassData.levels
        : null

      const initialHydratedLevel = editingClassData?.levels?.[0] || ""
      const isLevelUnchanged = isEditMode && level === initialHydratedLevel

      const payloadLevels = (isEditMode && originalLevels && (isLevelUnchanged || isLevelDisabled))
        ? originalLevels
        : [level]

      const payload = {
        courseId,
        title: className.trim(),
        language: selectedLanguage,
        levels: payloadLevels,
        description,
        totalSessions: sessionCount,
        enrollmentStart: admissionStart ? `${admissionStart}T00:00:00Z` : "",
        enrollmentEnd: admissionEnd ? `${admissionEnd}T00:00:00Z` : "",
        startDate: startDate ? `${startDate}T00:00:00Z` : "",
        schedule,
        slots: classCapacity,
        tuitionFee: parseFloat(fee) || 0,
        thumbnailUrl: thumbnailFile || thumbnailPreview || "",
        timezone: "Asia/Ho_Chi_Minh",
        cancelUrl: (
          window.location.origin
          + window.location.pathname
          + (
            isRecoverMode
              ? `?recoverClassId=${encodeURIComponent(String(recoverClassId))}`
              : (
                courseId
                  ? `?courseId=${encodeURIComponent(String(courseId))}`
                  : ""
              )
          )
        ),
      }

      if (isEditMode) {
        const updatePayload = {
          ...payload,
          thumbnailUrl: thumbnailFile || thumbnailPreview || "",
          commissionPercent: feeDetails.commissionRate,
        }
        request = updateClass({ id, courseId, data: updatePayload })
        activeMutationRequestRef.current = request
        await request.unwrap()
        if (
          !mountedRef.current
          || activeFormInstanceKeyRef.current !== submittedFormKey
        ) {
          return
        }
        toast.success(cc.toastUpdateSuccess || "Class updated successfully!")
        navigate("/workspace/classes/all-classes")
      } else {
        request = createClass(payload)
        activeMutationRequestRef.current = request
        const result = await request.unwrap()
        if (
          !mountedRef.current
          || activeFormInstanceKeyRef.current !== submittedFormKey
        ) {
          return
        }
        const resultPayload = result?.data ?? result
        if (
          !resultPayload
          || typeof resultPayload !== "object"
          || Array.isArray(resultPayload)
        ) {
          throw new Error("Unexpected create-class response")
        }

        const rawCheckoutUrl = resultPayload.checkoutUrl || resultPayload.paymentUrl || resultPayload.checkout_url
        const checkoutUrl = rawCheckoutUrl ? getSafeMediaUrl(rawCheckoutUrl) : null

        if (checkoutUrl) {
          toast.success(cc.toastRedirectPayment || "Redirecting to payment...")
          window.location.assign(checkoutUrl)
        } else {
          // Class created (free flow or direct creation)
          toast.success(cc.toastCreateSuccess || "Class created successfully!")
          navigate("/workspace/classes/all-classes")
        }
      }
    } catch (error) {
      if (
        !mountedRef.current
        || activeFormInstanceKeyRef.current !== submittedFormKey
        || error?.name === "AbortError"
      ) {
        return
      }
      const errData = error?.data
      const errCode = errData?.errorCode || errData?.code || errData?.error
      const errMsg = errData?.message || errData?.detail || error?.message || ""

      const isLanguageNotAllowed =
        errCode === "LANGUAGE_NOT_ALLOWED" ||
        (typeof errMsg === "string" && (errMsg.includes("LANGUAGE_NOT_ALLOWED") || errMsg.toLowerCase().includes("language not allowed"))) ||
        (typeof errCode === "string" && errCode.includes("LANGUAGE_NOT_ALLOWED"))

      const isScheduleLocked =
        errCode === "SCHEDULE_LOCKED" ||
        (typeof errMsg === "string" && (errMsg.includes("SCHEDULE_LOCKED") || errMsg.toLowerCase().includes("schedule_locked"))) ||
        (typeof errCode === "string" && errCode.includes("SCHEDULE_LOCKED"))

      const isLevelsLocked =
        errCode === "LEVELS_LOCKED" ||
        (typeof errMsg === "string" && (errMsg.includes("LEVELS_LOCKED") || errMsg.toLowerCase().includes("levels_locked"))) ||
        (typeof errCode === "string" && errCode.includes("LEVELS_LOCKED"))

      const isScheduleConflict =
        errCode === "SESSION_CONFLICT" ||
        errCode === "SCHEDULE_CONFLICT" ||
        (typeof errMsg === "string" && (
          errMsg.includes("SESSION_CONFLICT") ||
          errMsg.includes("SCHEDULE_CONFLICT") ||
          errMsg.toLowerCase().includes("session_conflict") ||
          errMsg.toLowerCase().includes("schedule_conflict")
        )) ||
        (typeof errCode === "string" && (errCode.includes("SESSION_CONFLICT") || errCode.includes("SCHEDULE_CONFLICT")))

      let displayMessage
      if (isLanguageNotAllowed) {
        displayMessage = cc.languageNotAllowed || c.createCourse?.languageNotAllowed || "The selected language or level is not allowed according to your instructor profile."
      } else if (isScheduleLocked) {
        displayMessage = cc.scheduleLocked || (typeof errMsg === "string" && errMsg.trim().length > 0 ? errMsg : "Teaching schedule cannot be changed for this class.")
      } else if (isLevelsLocked) {
        displayMessage = cc.levelsLocked || (typeof errMsg === "string" && errMsg.trim().length > 0 ? errMsg : "Class level cannot be changed for this class.")
      } else if (isScheduleConflict) {
        displayMessage = (typeof errMsg === "string" && errMsg.trim().length > 0 && !errMsg.includes("Unexpected") && !errMsg.includes("SESSION_CONFLICT") && !errMsg.includes("SCHEDULE_CONFLICT"))
          ? errMsg
          : (cc.toastScheduleConflictDefault || "Schedule conflict detected with another class!")
      } else if (typeof errMsg === "string" && errMsg.trim().length > 0 && !errMsg.includes("Unexpected") && !errMsg.includes("Missing")) {
        displayMessage = errMsg
      } else {
        displayMessage = isEditMode
          ? (cc.toastUpdateFail || "Failed to update class!")
          : (cc.toastCreateFail || "Failed to create class!")
      }

      toast.error(displayMessage)
    } finally {
      if (activeMutationRequestRef.current === request) {
        activeMutationRequestRef.current = null
      }
      if (activeFormInstanceKeyRef.current === submittedFormKey) {
        submitGuardRef.current = false
      }
    }
  }

  const handleDeleteClass = async () => {
    if (deleteGuardRef.current || isDeleting || !id) return
    deleteGuardRef.current = true
    const deletedFormKey = formInstanceKey
    let request = null
    try {
      request = deleteClass({ id, courseId })
      activeMutationRequestRef.current = request
      await request.unwrap()
      if (
        !mountedRef.current
        || activeFormInstanceKeyRef.current !== deletedFormKey
      ) {
        return
      }
      toast.success(cc.toastDeleteSuccess || "Class deleted successfully!")
      navigate("/workspace/classes/all-classes")
    } catch (error) {
      if (
        !mountedRef.current
        || activeFormInstanceKeyRef.current !== deletedFormKey
        || error?.name === "AbortError"
      ) {
        return
      }
      toast.error(cc.toastDeleteFail || "Failed to delete class!")
    } finally {
      if (activeMutationRequestRef.current === request) {
        activeMutationRequestRef.current = null
      }
      if (activeFormInstanceKeyRef.current === deletedFormKey) {
        deleteGuardRef.current = false
        setShowDeleteModal(false)
      }
    }
  }

  const lockedClass = (isEditMode ? classDetailResponse : recoverClassResponse)?.data
    || (isEditMode ? classDetailResponse : recoverClassResponse)
  const lockedCourseTitle = lockedClass?.courseName || lockedClass?.courseTitle || courseId
  const isFormBusy = isCreating || isUpdating || isDeleting

  if (
    isDetailsLoading
    || (
      !isEditMode
      && !isRecoverMode
      && (
        isCoursesLoading
        || (isCoursesFetching && coursesData === undefined)
      )
    )
  ) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#990011]"></div>
      </div>
    )
  }

  const detailsError = isEditMode ? editDetailsError : recoverDetailsError
  const hasMalformedDetails = (
    (isEditMode || isRecoverMode)
    && (
      !lockedClass
      || typeof lockedClass !== "object"
      || Array.isArray(lockedClass)
      || !lockedClass.id
    )
  )
  if (coursesError || detailsError || hasMalformedDetails) {
    return (
      <div role="alert" className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-semibold flex flex-col items-start gap-3">
        <span>{cc.loadFailed || "The class form could not be loaded. Please try again."}</span>
        <button
          type="button"
          onClick={() => {
            if (isEditMode) refetchEditDetails()
            else if (isRecoverMode) refetchRecoverDetails()
            else refetchCourses()
          }}
          className="rounded-xl bg-[#990011] px-4 py-2 text-xs font-bold text-white"
        >
          {cc.retry || "Try again"}
        </button>
      </div>
    )
  }

  const pageTitle = isEditMode
    ? (cc.editClass || "Edit Class")
    : isRecoverMode
      ? (cc.reopenClass || "Reopen Class (Recover)")
      : (cc.createClass || "Create Class")

  const sectionTitle = isEditMode
    ? (cc.classInformation || "Class Information")
    : isRecoverMode
      ? (cc.recoverClassInfo || "Recover Class Information")
      : (cc.classInfoTitle || cc.classInformation || "Thông tin lớp học")

  return (
    <div className="flex flex-col gap-6 text-[#2e2e2e] flex-1">

      {/* ─── Breadcrumb ─── */}
      <Breadcrumb
        items={[
          { label: t.nav?.home || "Trang chủ", onClick: isFormBusy ? undefined : () => navigate("/workspace") },
          { label: c.title || "Khóa học của tôi", onClick: isFormBusy ? undefined : () => navigate("/workspace/courses") },
          { label: c.allClasses?.title || "Toàn bộ lớp học", onClick: isFormBusy ? undefined : () => navigate("/workspace/classes/all-classes") },
          { label: pageTitle },
        ]}
      />

      {/* ─── Header ─── */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          disabled={isFormBusy}
          className="p-2.5 border border-gray-200 hover:bg-gray-100/80 text-gray-600 rounded-xl transition-all cursor-pointer shadow-2xs flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-50"
          title={t.common?.back || "Quay lại"}
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-gray-950">
          {pageTitle}
        </h1>
      </div>

      {/* ─── Main Form Box ─── */}
      <form
        onSubmit={handleSubmit}
        aria-busy={isFormBusy}
        className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col gap-6 flex-1"
      >

        <h2 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-2">
          {sectionTitle}
        </h2>

        {/* Form Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 flex-1">

          {/* LEFT COLUMN: Main input fields (Span 3 of 5) */}
          <div className="lg:col-span-3 flex flex-col gap-5">

            {/* Course Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">
                {cc.belongsToCourseOptional || cc.belongsToCourse || "Belongs to Course (Optional)"}
              </label>
              <div className="relative">
                <select
                  value={courseId}
                  onChange={(e) => handleCourseChange(e.target.value)}
                  disabled={isEditMode || isRecoverMode || !!initialCourseId}
                  className={`w-full h-11 pl-4 pr-10 bg-white border ${errors.courseId ? "border-red-500 ring-2 ring-red-200" : "border-gray-200 hover:border-gray-300 focus:border-[#990011]"} outline-none rounded-xl text-sm font-semibold text-gray-800 transition-all appearance-none cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-gray-100/70`}
                >
                  <option value="">{cc.noCourseOption || cc.selectCourseOption || "-- Standalone Class (No Course) --"}</option>
                  {isEditMode || isRecoverMode ? (
                    courseId && <option value={courseId}>{lockedCourseTitle}</option>
                  ) : (
                    coursesList.map((course) => (
                      <option key={course.id} value={course.id}>{course.title}</option>
                    ))
                  )}
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Class Name */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-extrabold text-[#700] uppercase tracking-wider">{cc.className} <span className="text-[#990011]">*</span></label>
              <input
                type="text"
                value={className}
                onChange={(e) => {
                  setField("className", e.target.value)
                  clearError("className")
                }}
                disabled={isRecoverMode}
                placeholder={cc.placeholderClassName || "Enter class name"}
                className={`w-full h-11 px-4 bg-white border ${errors.className ? "border-red-500 ring-2 ring-red-200" : "border-gray-200 hover:border-gray-300 focus:border-[#990011]"} outline-none rounded-xl text-sm font-semibold text-gray-800 transition-all placeholder:text-gray-400 disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-gray-100/70`}
              />
            </div>

            {/* Language & Level Select Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">{cc.language} <span className="text-[#990011]">*</span></label>
                <div className="relative">
                  <select
                    value={selectedLanguage}
                    onChange={(e) => {
                      setField("selectedLanguage", e.target.value)
                      setField("level", "")
                      clearError("selectedLanguage")
                    }}
                    disabled={isRecoverMode || !!initialCourseId || !!courseId}
                    className={`w-full h-11 pl-4 pr-10 bg-white border ${errors.selectedLanguage ? "border-red-500 ring-2 ring-red-200" : "border-gray-200 hover:border-gray-300 focus:border-[#990011]"} outline-none rounded-xl text-sm font-semibold text-gray-800 transition-all appearance-none cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-gray-100/70`}
                  >
                    <option value="" disabled hidden>{c.languagePlaceholder || "Eg. English, Chinese..."}</option>
                    {languagesList.map((lang) => (
                      <option key={lang.id} value={lang.name}>
                        {getLocalizedLanguageName(lang.name, t)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">{cc.level} <span className="text-[#990011]">*</span></label>
                <div className="relative">
                  <select
                    value={level}
                    onChange={(e) => {
                      setField("level", e.target.value)
                      clearError("level")
                    }}
                    disabled={!selectedLanguage || isRecoverMode || isLevelDisabled}
                    className={`w-full h-11 pl-4 pr-10 bg-white border ${errors.level ? "border-red-500 ring-2 ring-red-200" : "border-gray-200 hover:border-gray-300 focus:border-[#990011]"} outline-none rounded-xl text-sm font-semibold text-gray-800 transition-all appearance-none cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-gray-100/70`}
                  >
                    <option value="" disabled hidden>{c.levelPlaceholder || "Eg. A1, B2..."}</option>
                    {levelsList.map((lvl) => {
                      const lvlName = typeof lvl === "object" && lvl !== null ? (lvl.name || String(lvl)) : String(lvl)
                      const lvlKey = typeof lvl === "object" && lvl !== null ? (lvl.id || lvl.name) : String(lvl)
                      return (
                        <option key={lvlKey} value={lvlName}>
                          {lvlName}
                        </option>
                      )
                    })}
                  </select>
                  <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Admission Period & Start Date Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">{cc.admissionPeriod} <span className="text-[#990011]">*</span></label>
                <div className="flex items-center gap-1.5">
                  <div className="flex-1">
                    <DatePicker
                      value={admissionStart}
                      onChange={(date) => {
                        setField("admissionStart", date ? toLocalDateString(date) : "")
                        clearError("admissionStart")
                      }}
                      mode="date"
                      color="#990011"
                      placeholder="dd/MM/yyyy"
                      minDate={isEditMode ? null : tomorrow}
                      className={`w-full ${errors.admissionStart ? "border-red-500 ring-2 ring-red-200 rounded-xl" : ""}`}
                    />
                  </div>
                  <span className="text-gray-300 text-xs font-bold">-</span>
                  <div className="flex-1">
                    <DatePicker
                      value={admissionEnd}
                      onChange={(date) => {
                        setField("admissionEnd", date ? toLocalDateString(date) : "")
                        clearError("admissionEnd")
                      }}
                      mode="date"
                      color="#990011"
                      placeholder="dd/MM/yyyy"
                      minDate={isEditMode ? null : tomorrow}
                      className={`w-full ${errors.admissionEnd ? "border-red-500 ring-2 ring-red-200 rounded-xl" : ""}`}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 md:col-span-1">
                <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">{cc.startDate} <span className="text-[#990011]">*</span></label>
                <DatePicker
                  value={startDate}
                  onChange={(date) => {
                    setField("startDate", date ? toLocalDateString(date) : "")
                    clearError("startDate")
                  }}
                  mode="date"
                  color="#990011"
                  placeholder="dd/MM/yyyy"
                  minDate={isEditMode ? null : tomorrow}
                  className={`w-full ${errors.startDate ? "border-red-500 ring-2 ring-red-200 rounded-xl" : ""}`}
                />
              </div>
            </div>

            {/* Number of Sessions & Capacity Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Number of Sessions */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">{cc.numberOfSessions} <span className="text-[#990011]">*</span></label>
                <div className={`flex items-center bg-white border ${errors.sessions ? "border-red-500 ring-2 ring-red-200" : "border-gray-200 hover:border-gray-300 focus-within:border-[#990011]"} rounded-xl overflow-hidden h-11 transition-all`}>
                  <button
                    type="button"
                    onClick={() => setField("sessions", Math.max(1, (parseInt(sessions, 10) || 1) - 1))}
                    className="w-12 h-full bg-[#990011] hover:bg-[#80000e] text-white flex items-center justify-center transition-all font-bold select-none active:scale-95 cursor-pointer"
                  >
                    <Minus size={14} />
                  </button>
                  <input
                    type="number"
                    value={sessions}
                    onChange={(e) => {
                      setField("sessions", Math.max(1, parseInt(e.target.value, 10) || 1))
                      clearError("sessions")
                    }}
                    className="flex-1 h-full text-center bg-transparent border-none outline-none font-bold text-sm text-gray-800 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setField("sessions", (parseInt(sessions, 10) || 0) + 1)}
                    className="w-12 h-full bg-[#990011] hover:bg-[#80000e] text-white flex items-center justify-center transition-all font-bold select-none active:scale-95 cursor-pointer"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Capacity */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">{cc.capacity} <span className="text-[#990011]">*</span></label>
                <div className={`flex items-center bg-white border ${errors.capacity ? "border-red-500 ring-2 ring-red-200" : "border-gray-200 hover:border-gray-300 focus-within:border-[#990011]"} rounded-xl overflow-hidden h-11 transition-all`}>
                  <button
                    type="button"
                    onClick={() => setField("capacity", Math.max(1, (parseInt(capacity, 10) || 1) - 1))}
                    className="w-12 h-full bg-[#990011] hover:bg-[#80000e] text-white flex items-center justify-center transition-all font-bold select-none active:scale-95 cursor-pointer"
                  >
                    <Minus size={14} />
                  </button>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => {
                      setField("capacity", Math.max(1, parseInt(e.target.value, 10) || 1))
                      clearError("capacity")
                    }}
                    className="flex-1 h-full text-center bg-transparent border-none outline-none font-bold text-sm text-gray-800 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setField("capacity", (parseInt(capacity, 10) || 0) + 1)}
                    className="w-12 h-full bg-[#990011] hover:bg-[#80000e] text-white flex items-center justify-center transition-all font-bold select-none active:scale-95 cursor-pointer"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Teaching Schedule */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">{cc.teachingSchedule}</label>

              {/* Outer Gray Container */}
              <div className={`bg-white rounded-2xl p-4 border ${errors.checkedDays ? "border-red-500 ring-2 ring-red-200" : "border-gray-200"} flex flex-col gap-4`}>
                <span className="text-xs font-bold text-gray-500">
                  {cc.chooseDays || "Choose days of the week"}
                </span>

                {/* Weekdays selection grid inside */}
                <div className="grid grid-cols-7 border border-gray-200 rounded-xl overflow-hidden text-center divide-x divide-gray-200 bg-white">
                  {DAYS_OF_WEEK.map((day) => {
                    const isChecked = checkedDays[day.key]
                    return (
                      <div
                        key={day.key}
                        onClick={() => handleToggleDay(day.key)}
                        className={`flex flex-col gap-2.5 py-2.5 cursor-pointer select-none transition-all ${isChecked ? "bg-[#990011]/5" : "hover:bg-gray-50/50"
                          }`}
                      >
                        <span className={`text-[10px] font-black uppercase tracking-wider ${isChecked ? "text-[#990011]" : "text-gray-400"}`}>
                          {cc.days?.[day.key]?.short || cc.days?.[day.key]?.code || day.label}
                        </span>
                        <div className="flex justify-center">
                          <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${isChecked
                            ? "bg-[#990011] border-[#990011] text-white"
                            : "border-gray-300 bg-white"
                            }`}>
                            {isChecked && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Detailed schedule sub-label */}
                <span className="text-[11px] font-bold text-gray-500">
                  {cc.detailedSchedule || "Detailed schedule slots"}
                </span>

                {/* Time slots detailed grid */}
                <div className="flex flex-col gap-3">
                  {DAYS_OF_WEEK.map((day) => {
                    const isChecked = checkedDays[day.key]
                    if (!isChecked) return null

                    return (
                      <div key={day.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 first:pt-0 border-t border-gray-100 first:border-t-0">
                        {/* Day badge & label */}
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#990011] text-white font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                            {cc.days?.[day.key]?.code || cc.days?.[day.key]?.short || day.code}
                          </div>
                          <span className="text-sm font-bold text-gray-800">
                            {cc.days?.[day.key]?.full || day.fullName}
                          </span>
                        </div>

                        {/* Start and end times */}
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                          <DatePicker
                            value={timeSlots[day.key].start}
                            onChange={(val) => handleTimeChange(day.key, "start", val || "")}
                            mode="time"
                            color="#990011"
                            placeholder="--:--"
                            className="flex-1 sm:flex-initial sm:w-28"
                          />
                          <span className="text-gray-300 font-bold text-xs flex-shrink-0">-</span>
                          <DatePicker
                            value={timeSlots[day.key].end}
                            onChange={(val) => handleTimeChange(day.key, "end", val || "")}
                            mode="time"
                            color="#990011"
                            placeholder="--:--"
                            className="flex-1 sm:flex-initial sm:w-28"
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Description, Fees & Invite (Span 2 of 5) */}
          <div className="lg:col-span-2 flex flex-col gap-5">

            {/* Class Thumbnail */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">
                {cc.thumbnailLabel || c.avatarLabel || "Thumbnail"}
              </label>
              <div
                role="button"
                tabIndex={0}
                onClick={handleThumbnailClick}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    handleThumbnailClick()
                  }
                }}
                className="group relative border border-dashed border-gray-200 rounded-2xl p-4 bg-white hover:border-gray-300 hover:bg-gray-50/80 flex flex-col items-center justify-center text-center min-h-[150px] cursor-pointer transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#990011]"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleThumbnailFileChange}
                />
                {thumbnailPreview ? (
                  <div className="relative w-full max-h-[190px] flex justify-center overflow-hidden rounded-xl">
                    <img src={thumbnailPreview} alt="Class thumbnail preview" className="object-contain max-h-[180px]" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 group-focus:opacity-100 flex items-center justify-center text-white font-semibold text-sm transition-opacity rounded-xl">
                      {cc.changeThumbnail || "Change image"}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:scale-105 transition-transform">
                      <Upload size={20} />
                    </div>
                    <div className="text-xs text-gray-400 font-semibold space-y-1">
                      <p>{c.avatarDesc1 || "Supports PNG, JPEG, and WebP."}</p>
                      <p>{c.avatarDesc2 || "File size must be under 50mb"}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Class Description TinyMCE Editor */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">{cc.classDescription || "Mô tả lớp học"}</label>
              <Editor
                tinymceScriptSrc="https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.8.3/tinymce.min.js"
                value={description}
                disabled={isRecoverMode}
                onEditorChange={(newContent) => {
                  setField("description", newContent)
                  clearError("description")
                }}
                init={{
                  height: 220,
                  menubar: false,
                  statusbar: false,
                  plugins: ["autolink", "lists", "link", "charmap", "emoticons"],
                  toolbar:
                    "bold italic underline strikethrough | emoticons link | bullist numlist | removeformat",
                  placeholder: cc.placeholderDescription || "Enter class description (optional)",
                  skin: "oxide",
                  content_style: "body { font-family: Inter, sans-serif; font-size: 14px; color: #1f2937; }",
                  readonly: isRecoverMode,
                }}
              />
            </div>

            {/* Fee & Actual amount Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">{cc.feePerStudent} <span className="text-[#990011]">*</span></label>
                <div className="relative">
                  <input
                    type="text"
                    value={fee ? parseInt(fee).toLocaleString("vi-VN") : ""}
                    onChange={(e) => formatFeeInput(e.target.value)}
                    placeholder="850.000"
                    className="w-full h-11 pl-4 pr-12 bg-white border border-gray-200 hover:border-gray-300 focus:border-[#990011] outline-none rounded-xl text-sm font-extrabold text-gray-800 transition-all placeholder:text-gray-400"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-extrabold text-xs">VND</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">{cc.actualAmount}</label>
                <div className="relative">
                  <input
                    type="text"
                    value={amountReceived}
                    disabled
                    className="w-full h-11 pl-4 pr-12 bg-[#F2F2F2]/40 border border-transparent rounded-xl text-sm font-extrabold text-gray-500 cursor-not-allowed"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-450 font-extrabold text-xs">VND</span>
                </div>
              </div>
            </div>

            {/* Platform Fee info message */}
            <div className="flex gap-2 text-[10px] text-gray-400 font-bold items-start bg-gray-50/40 p-2.5 rounded-xl border border-gray-100">
              <Info size={13} className="text-[#990011] flex-shrink-0 mt-0.5" />
              <span>{labelCommissionNote}</span>
            </div>

            {/* Minimum Tuition Fee warning message */}
            {feeNum < minFee && (
              <div className="flex gap-2 text-[10px] text-[#e11d48] font-bold items-start bg-rose-50/40 p-2.5 rounded-xl border border-[#fda4af]">
                <Info size={13} className="text-[#e11d48] flex-shrink-0 mt-0.5" />
                <span>
                  {(cc.minTuitionFeeNote || "Mức học phí tối thiểu cho cấu hình lớp học này là {{minFee}} VNĐ. Vui lòng điều chỉnh lại!")
                    .replace("{{minFee}}", formatCurrency(minFee))}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-100 mt-auto">
          {/* Left Side: Fee detail */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#15803D]/10 flex items-center justify-center text-[#15803D]">
              <Info size={16} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-none">
                {cc.classOpeningFee || "CLASS OPENING FEE"}
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {feeDetails.openingFee > 0 && (
                  <span className="text-gray-400 line-through font-bold text-sm leading-none">
                    {formatCurrencyVND(feeDetails.openingFee)}
                  </span>
                )}
                <span className="text-[#15803D] font-black text-xl leading-none">
                  {formatCurrencyVND(0)}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#E8F8F0] text-[#15803D] border border-[#15803D]/20">
                  {cc.currentlyFreeNote || "Currently free to open classes"}
                </span>
              </div>
            </div>
          </div>

          {/* Right Side: Cancel & Confirm */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {isEditMode && (
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                disabled={isFormBusy}
                className="h-11 px-6 bg-[#e11d48] hover:bg-[#be123c] text-white font-bold text-xs rounded-full transition-all active:scale-95 shadow-sm hover:shadow-md flex items-center gap-1.5 justify-center disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Trash2 size={13} />
                <span>{cc.deleteClass || "Delete Class"}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate("/workspace/classes/all-classes")}
              disabled={isFormBusy}
              className="flex-1 sm:flex-initial h-11 px-6 border border-[#990011] text-[#990011] hover:bg-red-50/50 font-bold text-xs rounded-full transition-all active:scale-95 flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-50"
            >
              {cc.cancel}
            </button>
            <button
              type="submit"
              disabled={isFormBusy}
              className="flex-1 sm:flex-initial h-11 px-6 bg-[#990011] hover:bg-[#80000e] text-white font-bold text-xs rounded-full transition-all active:scale-95 shadow-sm hover:shadow-md flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isEditMode ? (cc.saveChanges || "Save Changes") : (cc.confirmPay || "Confirm & Pay")}
            </button>
          </div>
        </div>

      </form>

      <ConfirmationModal
        open={showDeleteModal}
        onClose={() => {
          if (!isDeleting) setShowDeleteModal(false)
        }}
        onConfirm={handleDeleteClass}
        isPending={isDeleting}
        title={cc.deleteClass || "Delete Class"}
        message={cc.confirmDeleteClassMsg || "Are you sure you want to delete this class? This action cannot be undone."}
        confirmText={cc.deleteConfirmButton || "Delete"}
        cancelText={cc.cancel || "Cancel"}
      />

    </div>
  )
}

export default CreateClassPage
