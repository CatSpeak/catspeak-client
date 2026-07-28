import React, { useState, useRef, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { toast } from "react-hot-toast"
import {
  Upload,
  ChevronDown,
  Trash2,
  ArrowLeft
} from "lucide-react"

import {
  useCreateCourseMutation,
  useGetCourseDetailQuery,
  useUpdateCourseMutation,
  useDeleteCourseMutation
} from "@/store/api/coursesApi"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import { COURSE_FORM_LANGUAGES } from "../data/courseFormOptions"
import { getSafeMediaUrl } from "../utils/courseUtils"

const CreateCoursePage = () => {
  const { t } = useLanguage()
  const c = t.courses || {}
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id
  const formInstanceKey = isEditMode ? `edit:${String(id)}` : "create"
  const fileInputRef = useRef(null)
  const imageReaderRef = useRef(null)
  const submitGuardRef = useRef(false)
  const previousFormInstanceKeyRef = useRef(null)
  const hydratedCourseKeyRef = useRef(null)

  const [createCourse, { isLoading: isCreating }] = useCreateCourseMutation()
  const [updateCourse, { isLoading: isUpdating }] = useUpdateCourseMutation()
  const {
    currentData: courseDetailResponse,
    isLoading: isDetailsLoading,
    isFetching: isDetailsFetching,
    error: detailsError,
    refetch: refetchDetails,
  } = useGetCourseDetailQuery(id, { skip: !isEditMode })
  const [deleteCourse, { isLoading: isDeleting }] = useDeleteCourseMutation()

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showClearModal, setShowClearModal] = useState(false)

  useEffect(() => () => {
    imageReaderRef.current?.abort()
  }, [])

  const handleDeleteCourse = async () => {
    if (!id || isDeleting) return
    try {
      await deleteCourse(id).unwrap()
      toast.success(c.courseDetail?.toastDeleteSuccess || "Course deleted successfully!")
      navigate("/workspace/courses")
    } catch {
      toast.error(c.courseDetail?.toastDeleteFailed || "Failed to delete course!")
    } finally {
      setShowDeleteModal(false)
    }
  }

  const languagesList = COURSE_FORM_LANGUAGES

  // Form states
  const [avatar, setAvatar] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState("")
  const [courseName, setCourseName] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState("")
  const [level, setLevel] = useState("")
  const [description, setDescription] = useState("")

  const cc = c.createCourse || {}
  const labelCourseAction = isEditMode ? (cc.updateCourse || "Update Course") : (c.createCourseTitle || "Tạo khóa học")
  const labelCourseInfoTitle = isEditMode ? (cc.updateCourseInfo || "Update Course Information") : (c.courseInfoTitle || "Thông tin khóa học")

  // Populate data when in edit mode
  useEffect(() => {
    if (previousFormInstanceKeyRef.current !== formInstanceKey) {
      previousFormInstanceKeyRef.current = formInstanceKey
      hydratedCourseKeyRef.current = null
      submitGuardRef.current = false
      imageReaderRef.current?.abort()
      imageReaderRef.current = null
      setShowDeleteModal(false)
      setShowClearModal(false)
      setAvatar(null)
      setAvatarPreview("")
      setCourseName("")
      setSelectedLanguage("")
      setLevel("")
      setDescription("")
    }

    if (
      isEditMode
      && courseDetailResponse
      && hydratedCourseKeyRef.current !== formInstanceKey
    ) {
      const course = courseDetailResponse.data || courseDetailResponse
      if (
        !course
        || typeof course !== "object"
        || Array.isArray(course)
        || !course.id
      ) {
        return
      }

      hydratedCourseKeyRef.current = formInstanceKey
      imageReaderRef.current?.abort()
      imageReaderRef.current = null
      setAvatar(null)
      setCourseName(course.title || course.name || "")

      const matchedLang = languagesList.find(
        (l) => (l.name || "").trim().toLowerCase() === (course.language || "").trim().toLowerCase()
      )
      const langName = matchedLang ? matchedLang.name : (course.language || "")
      setSelectedLanguage(langName)

      const rawLevel = Array.isArray(course.levels) ? course.levels[0] : (course.levels || course.level || "")
      setLevel(rawLevel || "")

      setDescription(course.description || "")
      setAvatarPreview(getSafeMediaUrl(course.thumbnailUrl) || "")
    }
  }, [courseDetailResponse, formInstanceKey, isEditMode, languagesList])

  const selectedLanguageObj = languagesList.find(
    (l) => (l.name || "").trim().toLowerCase() === (selectedLanguage || "").trim().toLowerCase()
  )
  const baseLevels = selectedLanguageObj?.levels || []
  const levelsList = [...baseLevels]
  if (level && !baseLevels.some((l) => (l.name || "").trim().toLowerCase() === level.trim().toLowerCase())) {
    levelsList.unshift({ id: "current-level", name: level })
  }

  // Handlers
  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleLanguageChange = (e) => {
    const newLang = e.target.value
    setSelectedLanguage(newLang)
    setLevel("")
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        toast.error(cc.toastInvalidImage || "Choose a JPG, PNG, or WebP image.")
        e.target.value = ""
        return
      }
      if (file.size > 50 * 1024 * 1024) {
        toast.error(c.avatarDesc2 || "Kích cỡ dưới 50mb")
        e.target.value = ""
        return
      }
      setAvatar(file)
      imageReaderRef.current?.abort()
      const reader = new FileReader()
      imageReaderRef.current = reader
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setAvatarPreview(reader.result)
        }
        imageReaderRef.current = null
      }
      reader.onerror = () => {
        imageReaderRef.current = null
        toast.error(cc.toastImageReadFail || "The selected image could not be read.")
      }
      reader.readAsDataURL(file)
      e.target.value = ""
    }
  }

  const resetFormInputs = () => {
    setAvatar(null)
    setAvatarPreview("")
    setCourseName("")
    setSelectedLanguage("")
    setLevel("")
    setDescription("")
  }

  const handleClear = () => {
    setShowClearModal(true)
  }

  const handleConfirmClear = () => {
    resetFormInputs()
    setShowClearModal(false)
    toast.success("Cleared form inputs")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitGuardRef.current || isCreating || isUpdating) return

    // Quick validation
    if (!courseName.trim()) {
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
    const descriptionWordCount = description.trim()
      ? description.trim().split(/\s+/).length
      : 0
    if (descriptionWordCount > 150) {
      toast.error(cc.descriptionTooLong || "The description cannot exceed 150 words.")
      return
    }

    submitGuardRef.current = true
    try {
      const payload = {
        title: courseName.trim(),
        language: selectedLanguage,
        levels: [level],
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
      const errData = err?.data
      const errCode = errData?.errorCode || errData?.code || errData?.error
      const errMsg = errData?.message || errData?.detail || errData?.title || ""

      const isLanguageNotAllowed =
        errCode === "LANGUAGE_NOT_ALLOWED" ||
        err?.status === 422 ||
        (typeof errMsg === "string" && (errMsg.includes("LANGUAGE_NOT_ALLOWED") || errMsg.toLowerCase().includes("language not allowed"))) ||
        (typeof errCode === "string" && errCode.includes("LANGUAGE_NOT_ALLOWED"))

      let displayMessage
      if (isLanguageNotAllowed) {
        displayMessage = cc.languageNotAllowed || "The selected language or level is not allowed according to your instructor profile."
      } else if (typeof errMsg === "string" && errMsg.trim().length > 0) {
        displayMessage = errMsg
      } else {
        displayMessage = isEditMode
          ? (cc.toastUpdateFailed || "Course update failed!")
          : (cc.toastCreateFailed || "Course creation failed!")
      }

      toast.error(displayMessage)
    } finally {
      submitGuardRef.current = false
    }
  }

  if (
    isEditMode
    && (
      isDetailsLoading
      || (isDetailsFetching && courseDetailResponse === undefined)
    )
  ) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#990011]"></div>
      </div>
    )
  }

  const courseDetails = courseDetailResponse?.data || courseDetailResponse
  const hasMalformedDetails = (
    isEditMode
    && (
      !courseDetails
      || typeof courseDetails !== "object"
      || Array.isArray(courseDetails)
      || !courseDetails.id
    )
  )
  if (detailsError || hasMalformedDetails) {
    return (
      <div role="alert" className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-semibold flex flex-col items-start gap-3">
        <span>{cc.loadFailed || "The course form could not be loaded. Please try again."}</span>
        <button type="button" onClick={refetchDetails} className="rounded-xl bg-[#990011] px-4 py-2 text-xs font-bold text-white">
          {cc.retry || "Try again"}
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 text-[#2e2e2e]">

      {/* ─── Breadcrumb ─── */}
      <div className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
        <button type="button" className="cursor-pointer hover:underline" onClick={() => navigate("/workspace")}>{t.nav?.home || "Trang chủ"}</button>
        <span>/</span>
        <button type="button" className="cursor-pointer hover:underline" onClick={() => navigate("/workspace/courses")}>{c.title || "Khóa học của tôi"}</button>
        <span>/</span>
        <span className="text-[#990011] font-semibold">
          {labelCourseAction}
        </span>
      </div>

      {/* ─── Header ─── */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-2.5 border border-gray-200 hover:bg-gray-100/80 text-gray-600 rounded-xl transition-all cursor-pointer shadow-2xs flex items-center justify-center"
          title={t.common?.back || "Quay lại"}
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-gray-950">
          {labelCourseAction}
        </h1>
      </div>

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
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault()
                handleAvatarClick()
              }
            }}
            role="button"
            tabIndex={0}
            className="group relative border border-dashed border-gray-200 hover:border-gray-300 rounded-2xl p-6 bg-[#F8F9FA] hover:bg-[#F2F2F2]/60 flex flex-col items-center justify-center cursor-pointer transition-colors duration-200 text-center min-h-[140px]"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
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
                  <p>{c.avatarDesc1 || "Supports PNG, JPEG, and WebP."}</p>
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
                disabled={!selectedLanguage}
                className="w-full h-11 pl-4 pr-10 bg-[#F2F2F2]/60 hover:bg-[#F2F2F2]/80 focus:bg-white border border-transparent focus:border-gray-200 outline-none rounded-xl text-sm font-semibold text-gray-800 transition-all appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="" disabled hidden>{c.levelPlaceholder || "Eg. A1, B2..."}</option>
                {levelsList.map((lvl) => (
                  <option key={lvl.id || lvl.name} value={lvl.name}>{lvl.name}</option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <ChevronDown size={14} />
              </div>
            </div>
          </div>
        </div>

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
            onClick={() => navigate(-1)}
            className="flex-1 sm:flex-initial h-11 px-6 border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-xs rounded-full transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft size={13} />
            <span>{t.common?.back || "Quay lại"}</span>
          </button>
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
        onClose={() => {
          if (!isDeleting) setShowDeleteModal(false)
        }}
        onConfirm={handleDeleteCourse}
        isPending={isDeleting}
        title={c.courseDetail?.deleteCourse || "Delete Course"}
        message={c.courseDetail?.confirmDeleteCourse || "Are you sure you want to delete this course? All associated classes will also be affected."}
        confirmText={c.courseDetail?.deleteCourse || "Delete"}
        cancelText={c.createClass?.cancel || "Cancel"}
      />

      <ConfirmationModal
        open={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={handleConfirmClear}
        title={c.clearBtn || "Clear"}
        message={c.deleteConfirm || "Bạn có chắc chắn muốn xóa tất cả thông tin đã điền?"}
        confirmText={c.clearBtn || "Clear"}
        cancelText={c.createClass?.cancel || "Cancel"}
      />
    </div>
  )
}

export default CreateCoursePage
