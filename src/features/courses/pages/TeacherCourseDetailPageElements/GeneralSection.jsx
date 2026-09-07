import React, { useState, useRef, useEffect, useMemo } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  Globe,
  GraduationCap,
  BookOpen,
  UsersRound,
  AlignLeft,
  Pencil,
  Share2,
  Check,
  Trash2,
} from "lucide-react"
import { toast } from "react-hot-toast"
import { useLanguage } from "@/shared/context/LanguageContext"
import RenderHTML from "@/shared/components/ui/RenderHTML"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import { copyShareLink } from "@/shared/utils/shareUtils"
import { getLocalizedLanguageName } from "../../data/courseFormOptions"
import {
  defaultCourseThumbnail,
  getSafeMediaUrl,
} from "../../utils/courseUtils"
import { useDeleteCourseMutation } from "@/store/api/coursesApi"

const GeneralSection = ({
  courseData = {},
  id: propId,
  onDeleteCourse: propOnDeleteCourse,
  className = "",
}) => {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const params = useParams()

  const id = propId || courseData?.id || params.id

  const c = t.courses || {}
  const cd = c.courseDetail || {}
  const ui = c.workspaceUi || {}

  const [showMenu, setShowMenu] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const menuRef = useRef(null)

  const [deleteCourse, { isLoading: isDeletingCourse }] =
    useDeleteCourseMutation()

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}/explore-courses/details/${id}`
    const ok = await copyShareLink({
      url: shareUrl,
      successMessage: cd.linkCopied || "Link copied!",
      errorMessage: cd.linkCopyFailed || "Failed to copy link",
    })
    if (ok) {
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    }
  }

  const handleDeleteCourse = async () => {
    if (!id || isDeletingCourse) return
    try {
      if (propOnDeleteCourse) {
        await propOnDeleteCourse()
      } else {
        await deleteCourse(id).unwrap()
        toast.success(cd.toastDeleteSuccess || "Course deleted successfully!")
        navigate("/workspace/courses")
      }
    } catch {
      toast.error(cd.toastDeleteFailed || "Failed to delete course!")
    } finally {
      setShowDeleteModal(false)
    }
  }

  const displayThumbnail =
    getSafeMediaUrl(courseData?.thumbnailUrl) || defaultCourseThumbnail

  const classes = useMemo(() => {
    return Array.isArray(courseData?.classes)
      ? courseData.classes.filter((item) => item && typeof item === "object")
      : []
  }, [courseData?.classes])

  // Lấy ra tất cả các trình độ của các class bên trong
  const classLevels = useMemo(() => {
    const levelsSet = new Set()
    classes.forEach((cls) => {
      if (Array.isArray(cls.levels)) {
        cls.levels.forEach((lvl) => {
          if (lvl && typeof lvl === "string" && lvl.trim()) {
            levelsSet.add(lvl.trim())
          }
        })
      } else if (typeof cls.level === "string" && cls.level.trim()) {
        cls.level.split(",").forEach((lvl) => {
          if (lvl.trim()) levelsSet.add(lvl.trim())
        })
      }
    })
    // Fallback sang trình độ của khóa học nếu các lớp chưa có
    if (levelsSet.size === 0) {
      if (Array.isArray(courseData?.levels)) {
        courseData.levels.forEach((lvl) => {
          if (lvl && typeof lvl === "string" && lvl.trim()) {
            levelsSet.add(lvl.trim())
          }
        })
      } else if (
        typeof courseData?.level === "string" &&
        courseData.level.trim()
      ) {
        courseData.level.split(",").forEach((lvl) => {
          if (lvl.trim()) levelsSet.add(lvl.trim())
        })
      }
    }
    return Array.from(levelsSet)
  }, [classes, courseData?.levels, courseData?.level])

  // Tính Số học viên của các class bên trong
  const totalStudents = useMemo(() => {
    return classes.reduce((sum, cls) => {
      const val = Number(
        cls.studentCount ??
          cls.enrolledStudents ??
          cls.enrolledCount ??
          cls.totalStudents,
      )
      return sum + (Number.isFinite(val) && val > 0 ? val : 0)
    }, 0)
  }, [classes])

  return (
    <div
      className={`bg-white rounded-3xl border border-border shadow-xs overflow-hidden flex flex-col ${className}`}
    >
      {/* ─── Visual Banner ─── */}
      <div className="relative p-6 sm:p-8 min-h-[380px] flex flex-col justify-end text-white">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${displayThumbnail})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/15" />
        </div>

        {/* Share / Copy Link Button */}
        <button
          type="button"
          onClick={handleCopyLink}
          title={cd.shareCourse || "Share course"}
          className="absolute top-4 right-4 z-10 h-10 w-10 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white transition-all active:scale-90 cursor-pointer"
        >
          {linkCopied ? <Check size={18} /> : <Share2 size={18} />}
        </button>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 w-full">
          <div className="flex flex-col gap-2 max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight">
              {courseData?.title || ui.untitledCourse || "Untitled course"}
            </h2>
          </div>

          {/* Menu button (Edit / Delete course) */}
          <div className="relative shrink-0" ref={menuRef}>
            <button
              type="button"
              aria-label={cd.courseActions || "Course actions"}
              aria-haspopup="menu"
              aria-expanded={showMenu}
              onClick={() => setShowMenu((prev) => !prev)}
              className="h-10 px-5 bg-[#b20a1c] hover:bg-[#990011] text-white font-bold text-sm rounded-full flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 active:shadow-sm cursor-pointer"
            >
              <Pencil size={14} />
              <span>{c.editCourse || "Customize"}</span>
            </button>

            {showMenu && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-48 bg-white border border-border rounded-2xl shadow-lg z-50 overflow-hidden divide-y divide-gray-50 text-gray-700"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setShowMenu(false)
                    navigate(
                      `/workspace/courses/edit/${encodeURIComponent(String(id))}`,
                    )
                  }}
                  className="w-full text-left p-3 hover:bg-gray-55 text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Pencil size={14} className="text-gray-500" />
                  <span>
                    {cd.editCourse ||
                      c.createCourse?.updateCourse ||
                      "Chỉnh sửa khóa học"}
                  </span>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setShowMenu(false)
                    setShowDeleteModal(true)
                  }}
                  className="w-full text-left p-3 hover:bg-gray-55 text-xs font-bold text-[#BA021C] flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Trash2 size={14} className="text-[#BA021C]" />
                  <span>{cd.deleteCourse || "Xóa khóa học"}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Information Card Content ─── */}
      <div className="p-6 flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Ngôn ngữ - Blue */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 shrink-0 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
              <Globe size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-400">
                {c.languageLabel || cd.language || "—"}
              </span>
              <span className="text-gray-900 font-bold text-sm mt-0.5">
                {getLocalizedLanguageName(courseData?.language, t) || "—"}
              </span>
            </div>
          </div>

          {/* Trình độ (tổng hợp từ các class bên trong) - Yellow */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 shrink-0 rounded-full bg-[#fff9cc] text-[#e3b709] flex items-center justify-center">
              <GraduationCap size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-400">
                {c.levelLabel || "Level"}
              </span>
              {classLevels.length > 0 ? (
                <div className="flex flex-wrap gap-1 mt-1">
                  {classLevels.map((lvl) => (
                    <span
                      key={lvl}
                      className="inline-flex items-center justify-center px-3 py-0.5 text-xs font-bold text-white bg-[#e3b709] rounded-full w-fit"
                    >
                      {lvl}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-gray-900 font-bold text-sm mt-0.5">
                  —
                </span>
              )}
            </div>
          </div>

          {/* Số lớp (classes.length) - Purple */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 shrink-0 rounded-full bg-[#fad9ff] text-[#c460d1] flex items-center justify-center">
              <BookOpen size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-400">
                {cd.totalClasses || c.totalClasses || "Số lớp"}
              </span>
              <span className="text-gray-900 font-bold text-sm mt-0.5">
                {classes.length}{" "}
                {cd.classesCountLabel || c.classesCountLabel || "lớp"}
              </span>
            </div>
          </div>

          {/* Số học viên (tổng studentCount của các class) - Orange */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 shrink-0 rounded-full bg-[#ffdcc4] text-[#ff8330] flex items-center justify-center">
              <UsersRound size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-400">
                {cd.totalStudents || c.totalStudents || "Số học viên"}
              </span>
              <span className="text-gray-900 font-bold text-sm mt-0.5">
                {totalStudents}{" "}
                {cd.studentsLabel || c.studentsLabel || "học viên"}
              </span>
            </div>
          </div>
        </div>

        {/* Mô tả */}
        <div className="flex items-start gap-3 border-t border-border pt-6">
          <div className="w-10 h-10 shrink-0 rounded-full bg-[#F3F4F6] text-[#4B5563] flex items-center justify-center">
            <AlignLeft size={18} />
          </div>
          <div className="flex flex-col gap-0 w-full min-w-0">
            <span className="text-sm text-gray-400">
              {cd.description || "Description"}
            </span>
            <RenderHTML
              html={courseData?.description}
              className="text-gray-600 text-sm leading-relaxed mt-0.5"
              fallback={
                <span className="text-gray-600 text-sm leading-relaxed mt-0.5">
                  {cd.noDescription || "No description provided."}
                </span>
              }
            />
          </div>
        </div>
      </div>

      {/* Confirmation modal xóa khóa học */}
      <ConfirmationModal
        open={showDeleteModal}
        onClose={() => {
          if (!isDeletingCourse) setShowDeleteModal(false)
        }}
        onConfirm={handleDeleteCourse}
        isPending={isDeletingCourse}
        title={cd.deleteCourse || "Delete Course"}
        message={
          cd.confirmDeleteCourse ||
          "Are you sure you want to delete this course? All associated classes will also be affected."
        }
        confirmText={cd.deleteCourse || "Delete"}
        cancelText={c.createClass?.cancel || "Cancel"}
      />
    </div>
  )
}

export default GeneralSection
