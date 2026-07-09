/* eslint-disable import/no-unresolved */
import React, { useState, useMemo, useRef, useEffect, useCallback } from "react"
import { useNavigate, useLocation, useParams } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { toast } from "react-hot-toast"
import {
  Clock,
  Plus,
  Minus,
  Info,
  ChevronDown,
  Upload,
  Trash2
} from "lucide-react"

import {
  useGetAllCoursesQuery,
  useCreateClassMutation,
  useGetClassDetailQuery,
  useUpdateClassMutation,
  useDeleteClassMutation
} from "@/store/api/coursesApi"
import ReactDatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import { calculateFees, formatCurrency, formatCurrencyVND, formatToYYYYMMDD } from "../utils/courseUtils"

const DAYS_OF_WEEK = [
  { key: "monday", label: "Mon", code: "T2", fullName: "Monday" },
  { key: "tuesday", label: "Tue", code: "T3", fullName: "Tuesday" },
  { key: "wednesday", label: "Wed", code: "T4", fullName: "Wednesday" },
  { key: "thursday", label: "Thu", code: "T5", fullName: "Thursday" },
  { key: "friday", label: "Fri", code: "T6", fullName: "Friday" },
  { key: "saturday", label: "Sat", code: "T7", fullName: "Saturday" },
  { key: "sunday", label: "Sun", code: "CN", fullName: "Sunday" }
]

const FALLBACK_TEACHER_PROFILE = {
  isVerified: true,
  languages: [
    { id: 1, name: "English", levels: [{ id: 1, name: "A1" }, { id: 2, name: "A2" }, { id: 3, name: "B1" }, { id: 4, name: "B2" }, { id: 5, name: "C1" }, { id: 6, name: "C2" }] },
    { id: 2, name: "Chinese", levels: [{ id: 1, name: "HSK 1" }, { id: 2, name: "HSK 2" }, { id: 3, name: "HSK 3" }, { id: 4, name: "HSK 4" }, { id: 5, name: "HSK 5" }, { id: 6, name: "HSK 6" }] },
    { id: 3, name: "Vietnamese", levels: [{ id: 1, name: "A1" }, { id: 2, name: "A2" }, { id: 3, name: "B1" }, { id: 4, name: "B2" }] }
  ],
  feeTiers: [
    { minSlots: 1, maxSlots: 6, openingFee: 0, commissionRate: 10 },
    { minSlots: 7, maxSlots: 20, openingFee: 200000, commissionRate: 12 },
    { minSlots: 21, maxSlots: 50, openingFee: 500000, commissionRate: 15 },
    { minSlots: 51, maxSlots: Infinity, openingFee: 0, commissionRate: 20 }
  ]
}

const CreateClassPage = () => {
  const { t } = useLanguage()
  const c = t.courses || {}
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id
  const fileInputRef = useRef(null)

  // Localizations
  const cc = c.createClass || {}

  const isProfileLoading = false
  const { data: coursesData } = useGetAllCoursesQuery({ pageSize: 100 })
  const [createClass, { isLoading: isCreating }] = useCreateClassMutation()
  const [updateClass, { isLoading: isUpdating }] = useUpdateClassMutation()
  const location = useLocation()
  const recoverClassId = location.state?.recoverClassId || new URLSearchParams(location.search).get("recoverClassId") || ""
  const isRecoverMode = !!recoverClassId

  const { data: classDetailResponse, isLoading: isEditDetailsLoading } = useGetClassDetailQuery(id, { skip: !isEditMode })
  const { data: recoverClassResponse, isLoading: isRecoverLoading } = useGetClassDetailQuery(recoverClassId, { skip: !isRecoverMode })
  const isDetailsLoading = isEditMode ? isEditDetailsLoading : (isRecoverMode ? isRecoverLoading : false)
  const [deleteClass, { isLoading: isDeleting }] = useDeleteClassMutation()

  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Static fallback teacher profile since /teacher/profile API does not exist
  const languagesList = FALLBACK_TEACHER_PROFILE.languages || []
  const coursesList = useMemo(() => coursesData?.data || [], [coursesData])

  // Check navigation state for initial course selection
  const initialCourseId = location.state?.courseId || ""

  // Form State
  const [courseId, setCourseId] = useState(initialCourseId)
  const [className, setClassName] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState("English")
  const [level, setLevel] = useState("A1")
  const [admissionStart, setAdmissionStart] = useState("")
  const [admissionEnd, setAdmissionEnd] = useState("")
  const [startDate, setStartDate] = useState("")
  const [sessions, setSessions] = useState(24)
  const [capacity, setCapacity] = useState(6)
  const [description, setDescription] = useState("")
  const [fee, setFee] = useState("850000")
  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState("")

  // Teaching Schedule State
  const [checkedDays, setCheckedDays] = useState({
    monday: true,
    tuesday: false,
    wednesday: true,
    thursday: false,
    friday: true,
    saturday: false,
    sunday: false
  })

  const [timeSlots, setTimeSlots] = useState({
    monday: { start: "18:00", end: "19:30" },
    tuesday: { start: "18:00", end: "19:30" },
    wednesday: { start: "18:00", end: "19:30" },
    thursday: { start: "18:00", end: "19:30" },
    friday: { start: "18:00", end: "19:30" },
    saturday: { start: "18:00", end: "19:30" },
    sunday: { start: "18:00", end: "19:30" }
  })

  // Helper functions for date conversion (local timezone safe)
  const toLocalDateString = (date) => {
    if (!date) return ""
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, "0")
    const d = String(date.getDate()).padStart(2, "0")
    return `${y}-${m}-${d}`
  }

  const parseLocalDateString = (str) => {
    if (!str) return null
    const [y, m, d] = str.split("-").map(Number)
    if (isNaN(y) || isNaN(m) || isNaN(d)) return null
    return new Date(y, m - 1, d)
  }

  // Minimum tuition fee calculation: (50k * slots) + (25k * sessions)
  const minFee = useMemo(() => {
    return (50000 * capacity) + (25000 * sessions)
  }, [capacity, sessions])

  // Automatically set tuition fee to minFee on load or configuration changes (only in Create mode)
  useEffect(() => {
    if (isEditMode || isRecoverMode) return
    const currentFeeNum = parseFloat(fee.replace(/[^0-9]/g, "")) || 0
    if (currentFeeNum < minFee) {
      setFee(minFee.toString())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minFee, isEditMode, isRecoverMode])

  const selectedLanguageObj = languagesList.find((l) => (l.name || "").toLowerCase() === (selectedLanguage || "").toLowerCase())
  const levelsList = selectedLanguageObj?.levels || []

  // Handlers
  const handleCourseChange = useCallback((id) => {
    setCourseId(id)
    const selectedCourse = coursesList.find(c => String(c.id) === String(id))
    if (selectedCourse) {
      setSelectedLanguage(selectedCourse.language)
      setLevel(selectedCourse.levels?.[0] || "")
      setSessions(selectedCourse.totalSessions || 24)



      setAdmissionStart(formatToYYYYMMDD(selectedCourse.enrollmentStart))
      setAdmissionEnd(formatToYYYYMMDD(selectedCourse.enrollmentEnd))
      setThumbnailFile(null)
      setThumbnailPreview(selectedCourse.thumbnailUrl || "")
    } else {
      setThumbnailFile(null)
      setThumbnailPreview("")
    }
  }, [coursesList])

  // Auto-fill course details if navigated from course details page
  useEffect(() => {
    if (initialCourseId && coursesList.length > 0) {
      handleCourseChange(initialCourseId)
    }
  }, [initialCourseId, coursesList, handleCourseChange])

  // Populate data when in edit or recover mode
  useEffect(() => {
    const responseData = isEditMode ? classDetailResponse : (isRecoverMode ? recoverClassResponse : null)
    if (responseData) {
      const cls = responseData.data || responseData
      setCourseId(cls.courseId || "")
      setClassName(cls.name || cls.title || "")
      setSelectedLanguage(cls.language || "English")
      setLevel(cls.levels?.[0] || "")



      setAdmissionStart(formatToYYYYMMDD(cls.enrollmentStart))
      setAdmissionEnd(formatToYYYYMMDD(cls.enrollmentEnd))
      setStartDate(formatToYYYYMMDD(cls.startDate))
      setSessions(cls.totalSessions || 24)
      setCapacity(cls.slots || 10)
      setDescription(cls.description || "")
      setFee(cls.tuitionFee?.toString() || "0")

      if (cls.thumbnailUrl) {
        setThumbnailPreview(cls.thumbnailUrl)
      } else {
        setThumbnailPreview("")
      }

      // Parse schedule
      if (cls.schedule) {
        const apiDaysToLocalKeys = {
          "MON": "monday",
          "TUE": "tuesday",
          "WED": "wednesday",
          "THU": "thursday",
          "FRI": "friday",
          "SAT": "saturday",
          "SUN": "sunday"
        }

        const updatedCheckedDays = {
          monday: false,
          tuesday: false,
          wednesday: false,
          thursday: false,
          friday: false,
          saturday: false,
          sunday: false
        }
        const updatedTimeSlots = {
          monday: { start: "18:00", end: "19:30" },
          tuesday: { start: "18:00", end: "19:30" },
          wednesday: { start: "18:00", end: "19:30" },
          thursday: { start: "18:00", end: "19:30" },
          friday: { start: "18:00", end: "19:30" },
          saturday: { start: "18:00", end: "19:30" },
          sunday: { start: "18:00", end: "19:30" }
        }

        const days = cls.schedule.days || (Array.isArray(cls.schedule) ? cls.schedule.map(s => s.dayOfWeek) : [])
        const startTime = cls.schedule.startTime || (Array.isArray(cls.schedule) ? cls.schedule[0]?.startTime : "18:00")
        const endTime = cls.schedule.endTime || (Array.isArray(cls.schedule) ? cls.schedule[0]?.endTime : "19:30")

        if (Array.isArray(cls.schedule)) {
          cls.schedule.forEach(item => {
            const key = apiDaysToLocalKeys[item.dayOfWeek]
            if (key) {
              updatedCheckedDays[key] = true
              updatedTimeSlots[key] = {
                start: item.startTime || "18:00",
                end: item.endTime || "19:30"
              }
            }
          })
        } else if (days) {
          days.forEach(day => {
            const key = apiDaysToLocalKeys[day]
            if (key) {
              updatedCheckedDays[key] = true
              updatedTimeSlots[key] = {
                start: startTime || "18:00",
                end: endTime || "19:30"
              }
            }
          })
        }
        setCheckedDays(updatedCheckedDays)
        setTimeSlots(updatedTimeSlots)
      }
    }
  }, [classDetailResponse, recoverClassResponse, isEditMode, isRecoverMode])

  const handleThumbnailClick = () => {
    fileInputRef.current?.click()
  }

  const handleThumbnailFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 50 * 1024 * 1024) {
      toast.error(c.avatarDesc2 || "File size must be under 50mb")
      e.target.value = ""
      return
    }

    setThumbnailFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setThumbnailPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleToggleDay = (day) => {
    setCheckedDays(prev => ({
      ...prev,
      [day]: !prev[day]
    }))
  }

  const handleTimeChange = (day, field, value) => {
    setTimeSlots(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }))
  }

  // Calculation: Actual amount received & fee details
  const feeNum = parseFloat(fee.replace(/[^0-9]/g, "")) || 0

  const feeDetails = useMemo(() => {
    return calculateFees(capacity, feeNum, FALLBACK_TEACHER_PROFILE.feeTiers)
  }, [feeNum, capacity])

  const amountReceived = formatCurrency(feeDetails.netPerStudent)

  const labelCommissionNote = (cc.commissionNote || "The platform will withhold a {{commission}}% commission fee on each successful student enrollment.")
    .replace("{{commission}}", feeDetails.commissionRate)
    .replace("{{amount}}", formatCurrency(feeDetails.commissionPerStudent))

  const formatFeeInput = (val) => {
    const cleaned = val.replace(/[^0-9]/g, "")
    setFee(cleaned)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!courseId) {
      toast.error(cc.toastSelectCourseFirst || "Please select a course first!")
      return
    }

    if (!className) {
      toast.error(cc.toastEnterClassName || "Please enter class name!")
      return
    }

    if (!admissionStart || !admissionEnd || !startDate) {
      toast.error(cc.toastAdmissionAndStart || "Please enter admission period and start date!")
      return
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const start = parseLocalDateString(startDate)
    const enrollStart = parseLocalDateString(admissionStart)
    const enrollEnd = parseLocalDateString(admissionEnd)

    if (!isEditMode) {
      if (enrollStart && enrollStart < today) {
        toast.error(cc.toastAdmissionStartPast || "Admission start date cannot be in the past!")
        return
      }
      if (enrollEnd && enrollEnd < today) {
        toast.error(cc.toastAdmissionEndPast || "Admission end date cannot be in the past!")
        return
      }
      if (start && start < today) {
        toast.error(cc.toastStartPast || "Start date cannot be in the past!")
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

    const checkedDaysList = Object.keys(checkedDays).filter(k => checkedDays[k])
    if (checkedDaysList.length === 0) {
      toast.error(cc.toastSelectSchedule || "Please select at least one teaching day!")
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

    try {
      if (!FALLBACK_TEACHER_PROFILE.isVerified) {
        toast.error(cc.toastVerifyProfile || "Please verify your profile identity to complete the transaction!")
        return
      }

      const payload = {
        courseId,
        title: className,
        language: selectedLanguage,
        levels: [level],
        description,
        totalSessions: sessions,
        enrollmentStart: admissionStart ? `${admissionStart}T00:00:00Z` : "",
        enrollmentEnd: admissionEnd ? `${admissionEnd}T00:00:00Z` : "",
        startDate: startDate ? `${startDate}T00:00:00Z` : "",
        schedule,
        slots: capacity,
        tuitionFee: parseFloat(fee) || 0,
        timezone: "Asia/Ho_Chi_Minh",
      }

      if (isEditMode) {
        const updatePayload = {
          ...payload,
          thumbnailUrl: thumbnailFile || thumbnailPreview || "",
          commissionPercent: feeDetails.commissionRate,
        }
        await updateClass({ id, data: updatePayload }).unwrap()
        toast.success(cc.toastUpdateSuccess || "Class updated successfully!")
        navigate("/workspace/courses/all-classes")
      } else {
        const result = await createClass(payload).unwrap()

        if (result.checkoutUrl) {
          toast.success(cc.toastRedirectPayment || "Redirecting to payment...")
          window.location.href = result.checkoutUrl
        } else if (result.classId) {
          // Free flow (capacity ≤ 6): class created immediately
          toast.success(cc.toastCreateSuccess || "Class created successfully!")
          navigate("/workspace/courses/all-classes")
        } else {
          // Fallback: assume success
          toast.success(cc.toastCreateSuccess || "Class created successfully!")
          navigate("/workspace/courses/all-classes")
        }
      }
    } catch (err) {
      console.error("Create/update class error details:", err)
      toast.error(err.data?.message || (isEditMode ? (cc.toastUpdateFail || "Failed to update class!") : (cc.toastCreateFail || "Failed to create class!")))
    }
  }

  const handleDeleteClass = async () => {
    try {
      await deleteClass(id).unwrap()
      toast.success(cc.toastDeleteSuccess || "Class deleted successfully!")
      navigate("/workspace/courses/all-classes")
    } catch (err) {
      toast.error(err.data?.message || (cc.toastDeleteFail || "Failed to delete class!"))
    } finally {
      setShowDeleteModal(false)
    }
  }

  if (isDetailsLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#990011]"></div>
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
      : (c.courseInfoTitle || "Thông tin khóa học")

  return (
    <div className="flex flex-col gap-6 text-[#2e2e2e]">

      {/* ─── Breadcrumb ─── */}
      <div className="text-xs text-gray-400 font-medium flex flex-wrap items-center gap-1.5">
        <span className="cursor-pointer hover:underline" onClick={() => navigate("/workspace")}>{t.nav?.home || "Trang chủ"}</span>
        <span>/</span>
        <span className="cursor-pointer hover:underline" onClick={() => navigate("/workspace/courses")}>{c.title || "Khóa học của tôi"}</span>
        <span>/</span>
        <span className="cursor-pointer hover:underline" onClick={() => navigate("/workspace/courses/all-classes")}>{c.allClasses?.title || "Toàn bộ lớp học"}</span>
        <span>/</span>
        <span className="text-[#990011] font-semibold">{pageTitle}</span>
      </div>

      {/* ─── Header ─── */}
      <h1 className="text-2xl font-bold tracking-tight text-gray-950">
        {pageTitle}
      </h1>

      {/* ─── Main Form Box ─── */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col gap-6">

        <h2 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-2">
          {sectionTitle}
        </h2>

        {/* Form Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* LEFT COLUMN: Main input fields (Span 3 of 5) */}
          <div className="lg:col-span-3 flex flex-col gap-5">

            {/* Course Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">
                {cc.belongsToCourse || "Belongs to Course"} <span className="text-[#990011]">*</span>
              </label>
              <div className="relative">
                <select
                  value={courseId}
                  onChange={(e) => handleCourseChange(e.target.value)}
                  disabled={isEditMode || isRecoverMode}
                  className="w-full h-11 pl-4 pr-10 bg-[#F2F2F2]/60 hover:bg-[#F2F2F2]/80 focus:bg-white border border-transparent focus:border-gray-200 outline-none rounded-xl text-sm font-semibold text-gray-800 transition-all appearance-none cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  <option value="">{cc.selectCourseOption || "-- Select Course --"}</option>
                  {coursesList.map((course) => (
                    <option key={course.id} value={course.id}>{course.title}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Class Name */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">{cc.className} <span className="text-[#990011]">*</span></label>
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                disabled={isRecoverMode}
                placeholder={cc.placeholderClassName || "Enter class name"}
                className="w-full h-11 px-4 bg-[#F2F2F2]/60 hover:bg-[#F2F2F2]/80 focus:bg-white border border-transparent focus:border-gray-200 outline-none rounded-xl text-sm font-semibold text-gray-800 transition-all placeholder:text-gray-400 disabled:opacity-75 disabled:cursor-not-allowed"
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
                      setSelectedLanguage(e.target.value)
                      setLevel("")
                    }}
                    disabled={isProfileLoading || isRecoverMode}
                    className="w-full h-11 pl-4 pr-10 bg-[#F2F2F2]/60 hover:bg-[#F2F2F2]/80 focus:bg-white border border-transparent focus:border-gray-200 outline-none rounded-xl text-sm font-semibold text-gray-800 transition-all appearance-none cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    <option value="" disabled hidden>{c.languagePlaceholder || "Eg. English, Chinese..."}</option>
                    {languagesList.map((lang) => (
                      <option key={lang.id} value={lang.name}>{lang.name}</option>
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
                    onChange={(e) => setLevel(e.target.value)}
                    disabled={isProfileLoading || !selectedLanguage || isRecoverMode}
                    className="w-full h-11 pl-4 pr-10 bg-[#F2F2F2]/60 hover:bg-[#F2F2F2]/80 focus:bg-white border border-transparent focus:border-gray-200 outline-none rounded-xl text-sm font-semibold text-gray-800 transition-all appearance-none cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    <option value="" disabled hidden>{c.levelPlaceholder || "Eg. A1, B2..."}</option>
                    {levelsList.map((lvl) => (
                      <option key={lvl.id} value={lvl.name}>{lvl.name}</option>
                    ))}
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
                  <div className="relative flex-1">
                    <ReactDatePicker
                      selected={parseLocalDateString(admissionStart)}
                      onChange={(date) => setAdmissionStart(date ? toLocalDateString(date) : "")}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="DD/MM/YYYY"
                      minDate={isEditMode ? null : new Date()}
                      wrapperClassName="w-full"
                      className="w-full h-11 px-3 pr-8 bg-[#F2F2F2]/60 hover:bg-[#F2F2F2]/80 focus:bg-white border border-transparent focus:border-gray-200 outline-none rounded-xl text-xs font-semibold text-gray-800 transition-all cursor-pointer"
                    />
                    <Clock size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
                  </div>
                  <span className="text-gray-300 text-xs font-bold">-</span>
                  <div className="relative flex-1">
                    <ReactDatePicker
                      selected={parseLocalDateString(admissionEnd)}
                      onChange={(date) => setAdmissionEnd(date ? toLocalDateString(date) : "")}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="DD/MM/YYYY"
                      minDate={isEditMode ? null : new Date()}
                      wrapperClassName="w-full"
                      className="w-full h-11 px-3 pr-8 bg-[#F2F2F2]/60 hover:bg-[#F2F2F2]/80 focus:bg-white border border-transparent focus:border-gray-200 outline-none rounded-xl text-xs font-semibold text-gray-800 transition-all cursor-pointer"
                    />
                    <Clock size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 md:col-span-1">
                <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">{cc.startDate} <span className="text-[#990011]">*</span></label>
                <div className="relative">
                  <ReactDatePicker
                    selected={parseLocalDateString(startDate)}
                    onChange={(date) => setStartDate(date ? toLocalDateString(date) : "")}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="DD/MM/YYYY"
                    minDate={isEditMode ? null : new Date()}
                    wrapperClassName="w-full"
                    className="w-full h-11 px-4 pr-10 bg-[#F2F2F2]/60 hover:bg-[#F2F2F2]/80 focus:bg-white border border-transparent focus:border-gray-200 outline-none rounded-xl text-sm font-semibold text-gray-800 transition-all cursor-pointer"
                  />
                  <Clock size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
                </div>
              </div>
            </div>

            {/* Number of Sessions & Capacity Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Number of Sessions */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">{cc.numberOfSessions} <span className="text-[#990011]">*</span></label>
                <div className="flex items-center bg-[#F2F2F2]/60 border border-transparent rounded-xl overflow-hidden h-11 focus-within:border-gray-200 focus-within:bg-white transition-all">
                  <button
                    type="button"
                    onClick={() => setSessions(prev => Math.max(1, prev - 1))}
                    className="w-12 h-full bg-[#990011] hover:bg-[#80000e] text-white flex items-center justify-center transition-all font-bold select-none active:scale-95"
                  >
                    <Minus size={14} />
                  </button>
                  <input
                    type="number"
                    value={sessions}
                    onChange={(e) => setSessions(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 h-full text-center bg-transparent border-none outline-none font-bold text-sm text-gray-800 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setSessions(prev => prev + 1)}
                    className="w-12 h-full bg-[#990011] hover:bg-[#80000e] text-white flex items-center justify-center transition-all font-bold select-none active:scale-95"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Capacity */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">{cc.capacity} <span className="text-[#990011]">*</span></label>
                <div className="flex items-center bg-[#F2F2F2]/60 border border-transparent rounded-xl overflow-hidden h-11 focus-within:border-gray-200 focus-within:bg-white transition-all">
                  <button
                    type="button"
                    onClick={() => setCapacity(prev => Math.max(1, prev - 1))}
                    className="w-12 h-full bg-[#990011] hover:bg-[#80000e] text-white flex items-center justify-center transition-all font-bold select-none active:scale-95"
                  >
                    <Minus size={14} />
                  </button>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 h-full text-center bg-transparent border-none outline-none font-bold text-sm text-gray-800 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setCapacity(prev => prev + 1)}
                    className="w-12 h-full bg-[#990011] hover:bg-[#80000e] text-white flex items-center justify-center transition-all font-bold select-none active:scale-95"
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
              <div className="bg-[#F2F2F2]/45 rounded-2xl p-4 border border-transparent flex flex-col gap-4">
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
                          {day.label}
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
                            {day.code}
                          </div>
                          <span className="text-sm font-bold text-gray-800">
                            {day.fullName}
                          </span>
                        </div>

                        {/* Start and end times */}
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                          <input
                            type="time"
                            value={timeSlots[day.key].start}
                            onChange={(e) => handleTimeChange(day.key, "start", e.target.value)}
                            className="h-9 px-3 flex-1 sm:flex-initial sm:w-28 bg-white border border-gray-200 focus:border-[#990011]/30 outline-none rounded-xl text-xs font-bold text-gray-800 transition-all cursor-pointer"
                          />
                          <span className="text-gray-300 font-bold text-xs flex-shrink-0">-</span>
                          <input
                            type="time"
                            value={timeSlots[day.key].end}
                            onChange={(e) => handleTimeChange(day.key, "end", e.target.value)}
                            className="h-9 px-3 flex-1 sm:flex-initial sm:w-28 bg-white border border-gray-200 focus:border-[#990011]/30 outline-none rounded-xl text-xs font-bold text-gray-800 transition-all cursor-pointer"
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
                onClick={isRecoverMode ? undefined : handleThumbnailClick}
                className={`group relative border border-dashed border-gray-200 rounded-2xl p-4 bg-[#F8F9FA] flex flex-col items-center justify-center text-center min-h-[150px] ${isRecoverMode ? "opacity-75 cursor-not-allowed" : "hover:border-gray-300 hover:bg-[#F2F2F2]/60 cursor-pointer transition-colors duration-200"
                  }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/svg+xml"
                  className="hidden"
                  onChange={handleThumbnailFileChange}
                />
                {thumbnailPreview ? (
                  <div className="relative w-full max-h-[190px] flex justify-center overflow-hidden rounded-xl">
                    <img src={thumbnailPreview} alt="Class thumbnail preview" className="object-contain max-h-[180px]" />
                    <div className={`absolute inset-0 bg-black/40 opacity-0 flex items-center justify-center text-white font-semibold text-sm transition-opacity rounded-xl ${isRecoverMode ? "" : "group-hover:opacity-100"
                      }`}>
                      {cc.changeThumbnail || "Change image"}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:scale-105 transition-transform">
                      <Upload size={20} />
                    </div>
                    <div className="text-xs text-gray-400 font-semibold space-y-1">
                      <p>{c.avatarDesc1 || "Supports png, jpeg and svg."}</p>
                      <p>{c.avatarDesc2 || "File size must be under 50mb"}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Class Description */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">{cc.classDescription}</label>
              <textarea
                rows={5}
                value={description}
                disabled={isRecoverMode}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={cc.placeholderDescription || "Enter class description (optional)"}
                className="w-full p-4 bg-[#F2F2F2]/60 hover:bg-[#F2F2F2]/80 focus:bg-white border border-transparent focus:border-gray-200 outline-none rounded-2xl text-sm font-semibold text-gray-800 transition-all resize-none placeholder:text-gray-400 disabled:opacity-75 disabled:cursor-not-allowed"
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
                    className="w-full h-11 pl-4 pr-12 bg-[#F2F2F2]/60 hover:bg-[#F2F2F2]/80 focus:bg-white border border-transparent focus:border-gray-200 outline-none rounded-xl text-sm font-extrabold text-gray-800 transition-all placeholder:text-gray-400"
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
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-100">
          {/* Left Side: Fee detail */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#990011]/5 flex items-center justify-center text-[#990011]">
              <Info size={16} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-0.5">
                {cc.classOpeningFee}
              </span>
              <span className="text-[#990011] font-black text-lg leading-none">
                {formatCurrencyVND(feeDetails.openingFee)}
              </span>
            </div>
          </div>

          {/* Right Side: Cancel & Confirm */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {isEditMode && (
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                disabled={isDeleting}
                className="h-11 px-6 bg-[#e11d48] hover:bg-[#be123c] text-white font-bold text-xs rounded-full transition-all active:scale-95 shadow-sm hover:shadow-md flex items-center gap-1.5 justify-center disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Trash2 size={13} />
                <span>{cc.deleteClass || "Delete Class"}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate("/workspace/courses/all-classes")}
              className="flex-1 sm:flex-initial h-11 px-6 border border-[#990011] text-[#990011] hover:bg-red-50/50 font-bold text-xs rounded-full transition-all active:scale-95 flex items-center justify-center"
            >
              {cc.cancel}
            </button>
            <button
              type="submit"
              disabled={isCreating || isUpdating}
              className="flex-1 sm:flex-initial h-11 px-6 bg-[#990011] hover:bg-[#80000e] text-white font-bold text-xs rounded-full transition-all active:scale-95 shadow-sm hover:shadow-md flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isEditMode ? (cc.saveChanges || "Save Changes") : (cc.confirmPay || "Confirm & Pay")}
            </button>
          </div>
        </div>

      </form>

      <ConfirmationModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteClass}
        title={cc.deleteClass || "Delete Class"}
        message={cc.confirmDeleteClassMsg || "Are you sure you want to delete this class? This action cannot be undone."}
        confirmText={cc.deleteConfirmButton || "Delete"}
        cancelText={cc.cancel || "Cancel"}
      />

    </div>
  )
}

export default CreateClassPage
