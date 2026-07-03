import React, { useState, useRef, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { toast } from "react-hot-toast"
import {
  Upload,
  Clock,
  ChevronDown,
  Trash2
} from "lucide-react"

import {
  useCreateCourseMutation,
  useGetCourseDetailQuery,
  useUpdateCourseMutation,
  useDeleteCourseMutation
} from "@/store/api/coursesApi"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import { utcToLocalDateStr } from "../utils/courseUtils"

const CreateCoursePage = () => {
  const { t } = useLanguage()
  const c = t.courses || {}
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id
  const fileInputRef = useRef(null)

  // API hooks
  // const { data: profileData, isLoading: isProfileLoading } = useGetTeacherProfileQuery()
  const isProfileLoading = false
  const [createCourse, { isLoading: isCreating }] = useCreateCourseMutation()
  const [updateCourse, { isLoading: isUpdating }] = useUpdateCourseMutation()
  const { data: courseDetailResponse, isLoading: isDetailsLoading } = useGetCourseDetailQuery(id, { skip: !isEditMode })
  const [deleteCourse, { isLoading: isDeleting }] = useDeleteCourseMutation()

  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const handleDeleteCourse = async () => {
    try {
      await deleteCourse(id).unwrap()
      toast.success(c.courseDetail?.toastDeleteSuccess || "Course deleted successfully!")
      navigate("/workspace/courses")
    } catch (err) {
      toast.error(err.data?.message || c.courseDetail?.toastDeleteFailed || "Failed to delete course!")
    } finally {
      setShowDeleteModal(false)
    }
  }

  // Static fallback teacher profile since /teacher/profile API does not exist
  const teacherProfile = {
    languages: [
      { id: 1, name: "English", levels: [{ id: 1, name: "A1" }, { id: 2, name: "A2" }, { id: 3, name: "B1" }, { id: 4, name: "B2" }, { id: 5, name: "C1" }, { id: 6, name: "C2" }] },
      { id: 2, name: "Chinese", levels: [{ id: 1, name: "HSK 1" }, { id: 2, name: "HSK 2" }, { id: 3, name: "HSK 3" }, { id: 4, name: "HSK 4" }, { id: 5, name: "HSK 5" }, { id: 6, name: "HSK 6" }] },
      { id: 3, name: "Vietnamese", levels: [{ id: 1, name: "A1" }, { id: 2, name: "A2" }, { id: 3, name: "B1" }, { id: 4, name: "B2" }] }
    ]
  }
  const languagesList = teacherProfile.languages || []

  // Form states
  const [avatar, setAvatar] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState("")
  const [courseName, setCourseName] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState("")
  const [level, setLevel] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [sessions, setSessions] = useState(24)
  const [description, setDescription] = useState("")

  const cc = c.createCourse || {}
  const labelCourseAction = isEditMode ? (cc.updateCourse || "Update Course") : (c.createCourseTitle || "Tạo khóa học")
  const labelCourseInfoTitle = isEditMode ? (cc.updateCourseInfo || "Update Course Information") : (c.courseInfoTitle || "Thông tin khóa học")

  // Populate data when in edit mode

  useEffect(() => {
    if (isEditMode && courseDetailResponse) {
      const course = courseDetailResponse.data || courseDetailResponse
      setCourseName(course.title || course.name || "")
      setSelectedLanguage(course.language || "")
      setLevel(course.levels?.[0] || "")
      setStartDate(utcToLocalDateStr(course.startDate))
      setEndDate(utcToLocalDateStr(course.endDate))
      setSessions(course.totalSessions || 24)
      setDescription(course.description || "")
      if (course.thumbnailUrl) {
        setAvatarPreview(course.thumbnailUrl)
      }
    }
  }, [courseDetailResponse, isEditMode])


  const selectedLanguageObj = languagesList.find((l) => l.name === selectedLanguage)
  const levelsList = selectedLanguageObj?.levels || []

  // Handlers
  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value)
    setLevel("")
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error(c.avatarDesc2 || "Kích cỡ dưới 50mb")
        return
      }
      setAvatar(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleClear = () => {
    if (window.confirm(c.deleteConfirm || "Bạn có chắc chắn muốn xóa tất cả thông tin đã điền?")) {
      setAvatar(null)
      setAvatarPreview("")
      setCourseName("")
      setSelectedLanguage("")
      setLevel("")
      setStartDate("")
      setEndDate("")
      setSessions(24)
      setDescription("")
      toast.success("Cleared form inputs")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Quick validation
    if (!courseName) {
      toast.error("Vui lòng điền tên khóa học!")
      return
    }
    if (!selectedLanguage) {
      toast.error("Vui lòng chọn ngôn ngữ!")
      return
    }
    if (!level) {
      toast.error("Vui lòng chọn trình độ!")
      return
    }

    try {
      const payload = {
        title: courseName,
        language: selectedLanguage,
        levels: [level],
        totalSessions: sessions,
        enrollmentStart: startDate ? `${startDate}T00:00:00Z` : "",
        enrollmentEnd: endDate ? `${endDate}T00:00:00Z` : "",
        description,
        thumbnailUrl: avatar || avatarPreview || "",
      }

      if (isEditMode) {
        await updateCourse({ id, data: payload }).unwrap()
        toast.success(cc.toastUpdateSuccess || "Course updated successfully!")
      } else {
        await createCourse(payload).unwrap()
        toast.success(c.createSuccess || "Đã tạo khóa học thành công!")
      }

      navigate("/workspace/courses")
    } catch (err) {
      toast.error(err.data?.message || (isEditMode ? (cc.toastUpdateFailed || "Course update failed!") : (cc.toastCreateFailed || "Course creation failed!")))
    }
  }

  if (isDetailsLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#990011]"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 text-[#2e2e2e]">

      {/* ─── Breadcrumb ─── */}
      <div className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
        <span className="cursor-pointer hover:underline" onClick={() => navigate("/workspace")}>{t.nav?.home || "Trang chủ"}</span>
        <span>/</span>
        <span className="cursor-pointer hover:underline" onClick={() => navigate("/workspace/courses")}>{c.title || "Khóa học của tôi"}</span>
        <span>/</span>
        <span className="text-[#990011] font-semibold">
          {labelCourseAction}
        </span>
      </div>

      {/* ─── Header ─── */}
      <h1 className="text-2xl font-bold tracking-tight text-gray-950">
        {labelCourseAction}
      </h1>

      {/* ─── Form Container ─── */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col gap-6">

        <h2 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-2">
          {labelCourseInfoTitle}
        </h2>

        {/* ─── Avatar upload box ─── */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">{c.avatarLabel || "Ảnh đại diện"}</label>
          <div
            onClick={handleAvatarClick}
            className="group relative border border-dashed border-gray-200 hover:border-gray-300 rounded-2xl p-6 bg-[#F8F9FA] hover:bg-[#F2F2F2]/60 flex flex-col items-center justify-center cursor-pointer transition-colors duration-200 text-center min-h-[140px]"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/svg+xml"
              className="hidden"
              onChange={handleFileChange}
            />
            {avatarPreview ? (
              <div className="relative w-full max-h-[220px] flex justify-center overflow-hidden rounded-xl">
                <img src={avatarPreview} alt="Avatar preview" className="object-contain max-h-[200px]" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-semibold text-sm transition-opacity rounded-xl">
                  Thay đổi hình ảnh
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:scale-105 transition-transform">
                  <Upload size={20} />
                </div>
                <div className="text-xs text-gray-400 font-semibold space-y-1">
                  <p>{c.avatarDesc1 || "Hỗ trợ định dạng png, jpeg và svg."}</p>
                  <p>{c.avatarDesc2 || "Kích cỡ dưới 50mb"}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── Course Name ─── */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">{c.courseNameLabel || "Tên khóa học"} <span className="text-[#990011]">*</span></label>
          <input
            type="text"
            placeholder={c.courseNamePlaceholder || "Tên sự kiện"}
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            className="w-full h-11 px-4 bg-[#F2F2F2]/60 hover:bg-[#F2F2F2]/80 focus:bg-white border border-transparent focus:border-gray-200 outline-none rounded-xl text-sm font-semibold text-gray-800 transition-all placeholder:text-gray-400"
          />
        </div>

        {/* ─── Language & Level ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">{c.languageLabel || "Ngôn ngữ"}</label>
            <div className="relative">
              <select
                value={selectedLanguage}
                onChange={handleLanguageChange}
                disabled={isProfileLoading}
                className="w-full h-11 pl-4 pr-10 bg-[#F2F2F2]/60 hover:bg-[#F2F2F2]/80 focus:bg-white border border-transparent focus:border-gray-200 outline-none rounded-xl text-sm font-semibold text-gray-800 transition-all appearance-none cursor-pointer"
              >
                <option value="" disabled hidden>{c.languagePlaceholder || "Eg. English, Chinese..."}</option>
                {languagesList.map((lang) => (
                  <option key={lang.id} value={lang.name}>{lang.name}</option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <ChevronDown size={14} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">{c.levelLabel || "Trình độ"}</label>
            <div className="relative">
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                disabled={isProfileLoading || !selectedLanguage}
                className="w-full h-11 pl-4 pr-10 bg-[#F2F2F2]/60 hover:bg-[#F2F2F2]/80 focus:bg-white border border-transparent focus:border-gray-200 outline-none rounded-xl text-sm font-semibold text-gray-800 transition-all appearance-none cursor-pointer"
              >
                <option value="" disabled hidden>{c.levelPlaceholder || "Eg. A1, B2..."}</option>
                {levelsList.map((lvl) => (
                  <option key={lvl.id} value={lvl.name}>{lvl.name}</option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <ChevronDown size={14} />
              </div>
            </div>
          </div>
        </div>

        {/* ─── Start Date & End Date ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">{c.startDateLabel || "Thời gian bắt đầu"}</label>
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-11 px-4 pr-10 bg-[#F2F2F2]/60 hover:bg-[#F2F2F2]/80 focus:bg-white border border-transparent focus:border-gray-200 outline-none rounded-xl text-sm font-semibold text-gray-800 transition-all cursor-pointer"
              />
              <Clock size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">{c.endDateLabel || "Thời gian kết thúc"}</label>
            <div className="relative">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full h-11 px-4 pr-10 bg-[#F2F2F2]/60 hover:bg-[#F2F2F2]/80 focus:bg-white border border-transparent focus:border-gray-200 outline-none rounded-xl text-sm font-semibold text-gray-800 transition-all cursor-pointer"
              />
              <Clock size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* ─── Sessions ─── */}
        {/* <div className="flex flex-col gap-2">
          <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">{c.sessionsLabel || "Số buổi dạy"} <span className="text-[#990011]">*</span></label>
          <div className="flex items-center bg-[#F2F2F2]/60 border border-transparent rounded-xl overflow-hidden h-11 focus-within:border-gray-200 focus-within:bg-white transition-all">
            <button
              type="button"
              onClick={() => setSessions(prev => Math.max(1, (parseInt(prev) || 24) - 1))}
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
              onClick={() => setSessions(prev => (parseInt(prev) || 24) + 1)}
              className="w-12 h-full bg-[#990011] hover:bg-[#80000e] text-white flex items-center justify-center transition-all font-bold select-none active:scale-95"
            >
              <Plus size={14} />
            </button>
          </div>
        </div> */}

        {/* ─── Description ─── */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">{c.descriptionLabel || "Mô tả khóa học (tùy chọn)"}</label>
          <textarea
            rows={4}
            placeholder={c.descriptionPlaceholder || "Nội dung"}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-4 bg-[#F2F2F2]/60 hover:bg-[#F2F2F2]/80 focus:bg-white border border-transparent focus:border-gray-200 outline-none rounded-xl text-sm font-semibold text-gray-800 transition-all resize-none placeholder:text-gray-400"
          />
          <span className="text-[10px] text-gray-400 font-bold self-end">
            {c.descriptionLimitNote || "Nội dung không được quá 150 từ"}
          </span>
        </div>

        {/* ─── Action Buttons ─── */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100 mt-2 w-full">
          {isEditMode && (
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              disabled={isDeleting}
              className="mr-auto h-11 px-6 bg-[#e11d48] hover:bg-[#be123c] text-white font-bold text-xs rounded-full transition-all active:scale-95 shadow-sm hover:shadow-md flex items-center gap-1.5 justify-center disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Trash2 size={13} />
              <span>{c.courseDetail?.deleteCourse || "Delete Course"}</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleClear}
            className="flex-1 sm:flex-initial h-11 px-6 border border-[#990011] text-[#990011] hover:bg-red-50/50 font-bold text-xs rounded-full transition-all active:scale-95 flex items-center justify-center"
          >
            {c.clearBtn || "Xóa"}
          </button>
          <button
            type="submit"
            disabled={isCreating || isUpdating}
            className="flex-1 sm:flex-initial h-11 px-6 bg-[#990011] hover:bg-[#80000e] text-white font-bold text-xs rounded-full transition-all active:scale-95 shadow-sm hover:shadow-md flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {labelCourseAction}
          </button>
        </div>

      </form>

      <ConfirmationModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteCourse}
        title={c.courseDetail?.deleteCourse || "Delete Course"}
        message={c.courseDetail?.confirmDeleteCourse || "Are you sure you want to delete this course? All associated classes will also be affected."}
        confirmText={c.courseDetail?.deleteCourse || "Delete"}
        cancelText={c.createClass?.cancel || "Cancel"}
      />
    </div>
  )
}

export default CreateCoursePage
