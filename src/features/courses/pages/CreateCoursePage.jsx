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
import { TextInput } from "@/shared/components/ui/inputs"
import Dropdown from "@/shared/components/ui/Dropdown"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import { COURSE_FORM_LANGUAGES } from "../data/courseFormOptions"
import { getSafeMediaUrl } from "../utils/courseUtils"

const CreateCoursePage = () => {
  const { t } = useLanguage()
  const c = t.courses || {}
  const cc = c.createCourse || {}
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

  const labelCourseAction = isEditMode
    ? (cc.updateCourse || "Cập nhật khóa học")
    : (cc.title || c.createCourseTitle || "Tạo khóa học")
  const labelCourseInfoTitle = isEditMode
    ? (cc.updateCourseInfo || "Thông tin khóa học cập nhật")
    : (c.courseInfoTitle || "Thông tin khóa học")

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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        toast.error(cc.toastInvalidImage || "Choose a JPG, PNG, or WebP image.")
        e.target.value = ""
        return
      }
      if (file.size > 50 * 1024 * 1024) {
        toast.error(cc.avatarDesc2 || c.avatarDesc2 || "Kích cỡ dưới 50MB")
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
    toast.success(cc.toastClearSuccess || "Cleared form inputs")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitGuardRef.current || isCreating || isUpdating) return

    // Quick validation
    if (!courseName.trim()) {
      toast.error(cc.enterCourseNameToast || "Vui lòng điền tên khóa học!")
      return
    }
    if (!selectedLanguage) {
      toast.error(cc.selectLanguageToast || "Vui lòng chọn ngôn ngữ!")
      return
    }
    if (!level) {
      toast.error(cc.selectLevelToast || "Vui lòng chọn trình độ!")
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
    } catch {
      toast.error(isEditMode
        ? (cc.toastUpdateFailed || "Course update failed!")
        : (cc.toastCreateFailed || "Course creation failed!"))
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
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm flex flex-col gap-6">

        <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
          {labelCourseInfoTitle}
        </h2>

        {/* ─── 2-Column Split Layout ─── */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* Left Column: Course Avatar / Thumbnail Card */}
          <div className="w-full lg:w-72 xl:w-80 shrink-0 flex flex-col gap-2.5">
            <label className="text-sm font-semibold text-gray-800">
              {cc.avatarLabel || c.avatarLabel || "Ảnh đại diện khóa học"}
            </label>

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
              className="group relative w-full aspect-[4/3] rounded-xl border border-dashed border-gray-200 hover:border-gray-300 bg-gray-50/50 hover:bg-gray-100/50 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 overflow-hidden shadow-2xs"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
              {avatarPreview ? (
                <div className="relative w-full h-full">
                  <img
                    src={avatarPreview}
                    alt="Course Thumbnail"
                    className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 text-white font-semibold text-xs transition-opacity p-4 text-center">
                    <div className="flex items-center gap-1.5 bg-black/70 px-3 py-1.5 rounded-lg backdrop-blur-xs hover:bg-black/90 transition-colors">
                      <Upload size={14} />
                      <span>{cc.changeImage || "Thay đổi ảnh"}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setAvatar(null)
                        setAvatarPreview("")
                      }}
                      className="px-2.5 py-1.5 bg-red-600/90 hover:bg-red-600 rounded-lg transition-colors text-white text-xs font-medium flex items-center gap-1"
                    >
                      <Trash2 size={13} />
                      <span>{cc.removeImage || "Xóa ảnh"}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 p-4 text-center">
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 shadow-2xs flex items-center justify-center text-gray-400 group-hover:text-[#990011] group-hover:scale-105 transition-all">
                    <Upload size={18} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-gray-800">
                      {cc.avatarDesc1 || c.avatarDesc1 || "Kéo & thả hoặc bấm để chọn ảnh"}
                    </p>
                    <p className="text-[11px] text-gray-400 font-medium">
                      {cc.avatarDesc2 || c.avatarDesc2 || "PNG, JPG, WEBP (tối đa 50MB)"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <p className="text-[11px] text-gray-400 font-medium text-center">
              {cc.avatarHint || "Khuyên dùng hình ảnh tỉ lệ 4:3 sắc nét để hiển thị tối ưu nhất."}
            </p>
          </div>

          {/* Right Column: Form Inputs */}
          <div className="flex-1 w-full flex flex-col gap-5">

            {/* Course Name */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-800">
                {cc.courseNameLabel || c.courseNameLabel || "Tên khóa học"} <span className="text-[#990011]">*</span>
              </label>
              <TextInput
                placeholder={cc.courseNamePlaceholder || c.courseNamePlaceholder || "Nhập tên khóa học..."}
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                variant="semi-round"
                className="!h-11 !rounded-xl bg-gray-50/50 hover:bg-gray-100/50 border border-gray-100 text-sm font-medium text-gray-800"
                containerClassName="!gap-0"
              />
            </div>

            {/* Language & Level Side-by-Side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-800">
                  {cc.languageLabel || c.languageLabel || "Ngôn ngữ"} <span className="text-[#990011]">*</span>
                </label>
                <Dropdown
                  options={languagesList.map((lang) => ({
                    value: lang.name,
                    label: lang.name,
                  }))}
                  value={selectedLanguage}
                  onChange={(val) => {
                    setSelectedLanguage(val)
                    setLevel("")
                  }}
                  placeholder={cc.languagePlaceholder || c.languagePlaceholder || "Chọn ngôn ngữ"}
                  dropdownClassName="w-full"
                  trigger={(isOpen, selectedOption, toggle) => (
                    <button
                      type="button"
                      onClick={toggle}
                      className="w-full h-11 px-3.5 rounded-xl flex items-center justify-between gap-2 transition bg-gray-50/50 border border-gray-100 text-gray-800 hover:bg-gray-100/50 cursor-pointer text-sm font-medium"
                    >
                      <span className={selectedLanguage ? "text-gray-900 font-medium" : "text-gray-400 font-normal"}>
                        {selectedLanguage || (cc.languagePlaceholder || c.languagePlaceholder || "Chọn ngôn ngữ")}
                      </span>
                      <ChevronDown size={16} className={`text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                  )}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-800">
                  {cc.levelLabel || c.levelLabel || "Trình độ"} <span className="text-[#990011]">*</span>
                </label>
                <Dropdown
                  options={levelsList.map((lvl) => ({
                    value: lvl.name,
                    label: lvl.name,
                  }))}
                  value={level}
                  onChange={(val) => setLevel(val)}
                  disabled={!selectedLanguage}
                  placeholder={cc.levelPlaceholder || c.levelPlaceholder || "Chọn trình độ"}
                  dropdownClassName="w-full"
                  trigger={(isOpen, selectedOption, toggle) => (
                    <button
                      type="button"
                      onClick={toggle}
                      disabled={!selectedLanguage}
                      className={`w-full h-11 px-3.5 rounded-xl flex items-center justify-between gap-2 transition text-sm font-medium border ${
                        !selectedLanguage
                          ? "bg-gray-50/50 border-gray-100 text-gray-400 cursor-not-allowed opacity-60"
                          : "bg-gray-50/50 border-gray-100 text-gray-800 hover:bg-gray-100/50 cursor-pointer"
                      }`}
                    >
                      <span className={level ? "text-gray-900 font-medium" : "text-gray-400 font-normal"}>
                        {level || (cc.levelPlaceholder || c.levelPlaceholder || "Chọn trình độ")}
                      </span>
                      <ChevronDown size={16} className={`text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                  )}
                />
              </div>
            </div>

            {/* Description Textarea */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-800">
                  {cc.descriptionLabel || c.descriptionLabel || "Mô tả khóa học (tùy chọn)"}
                </label>
                <span className="text-xs text-gray-400 font-medium">
                  {cc.descriptionLimitNote || c.descriptionLimitNote || "Nội dung không quá 150 từ"}
                </span>
              </div>
              <textarea
                rows={4}
                placeholder={cc.descriptionPlaceholder || c.descriptionPlaceholder || "Nhập thông tin mô tả tổng quan về khóa học..."}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3.5 bg-gray-50/50 hover:bg-gray-100/50 focus:bg-white border border-gray-100 focus:border-gray-200 outline-none rounded-xl text-sm font-medium text-gray-800 transition-all resize-y min-h-[110px] placeholder:text-gray-400 placeholder:font-normal"
              />
            </div>

          </div>

        </div>

        {/* ─── Action Buttons ─── */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100 mt-2 w-full">
          {isEditMode && (
            <PillButton
              type="button"
              variant="outline"
              onClick={() => setShowDeleteModal(true)}
              disabled={isDeleting}
              className="mr-auto !border-red-500 !text-red-600 hover:!bg-red-50"
            >
              <Trash2 size={16} />
              <span>{c.courseDetail?.deleteCourse || "Xóa khóa học"}</span>
            </PillButton>
          )}
          <PillButton
            type="button"
            variant="secondary"
            onClick={handleClear}
          >
            {cc.clear || c.clearBtn || "Làm mới"}
          </PillButton>
          <PillButton
            type="submit"
            variant="primary"
            disabled={isCreating || isUpdating}
          >
            {labelCourseAction}
          </PillButton>
        </div>

      </form>

      <ConfirmationModal
        open={showDeleteModal}
        onClose={() => {
          if (!isDeleting) setShowDeleteModal(false)
        }}
        onConfirm={handleDeleteCourse}
        isPending={isDeleting}
        title={c.courseDetail?.deleteCourse || "Xóa khóa học"}
        message={c.courseDetail?.confirmDeleteCourse || "Bạn có chắc chắn muốn xóa khóa học này? Tất cả các lớp học liên quan cũng sẽ bị ảnh hưởng."}
        confirmText={c.courseDetail?.deleteCourse || "Xóa"}
        cancelText={c.createClass?.cancel || t.common?.cancel || "Hủy"}
      />

      <ConfirmationModal
        open={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={handleConfirmClear}
        title={cc.clear || c.clearBtn || "Làm mới"}
        message={c.deleteConfirm || "Bạn có chắc chắn muốn xóa tất cả thông tin đã điền?"}
        confirmText={cc.clear || c.clearBtn || "Làm mới"}
        cancelText={c.createClass?.cancel || t.common?.cancel || "Hủy"}
      />
    </div>
  )
}

export default CreateCoursePage
