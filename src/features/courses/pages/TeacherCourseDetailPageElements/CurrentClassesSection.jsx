import React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Pencil } from "lucide-react"
import ClassCard from "../../components/ClassCard"
import { useLanguage } from "@/shared/context/LanguageContext"
import { copyShareLink } from "@/shared/utils/shareUtils"

const CurrentClassesSection = ({
  courseData = {},
  classes: propClasses,
  className = "",
}) => {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const params = useParams()

  const c = t.courses || {}
  const cd = c.courseDetail || {}
  const courseId = courseData?.id || params.id

  const classes =
    propClasses ||
    (Array.isArray(courseData?.classes)
      ? courseData.classes.filter((item) => item && typeof item === "object")
      : [])

  const handleShareClass = async (clsItem) => {
    const classId = clsItem?.id || clsItem?._id
    if (!classId) return
    const shareUrl = `${window.location.origin}/explore-courses/class/${classId}`
    await copyShareLink({
      url: shareUrl,
      successMessage: c.classDetail?.linkCopied || "Link copied!",
      errorMessage: c.classDetail?.linkCopyFailed || "Failed to copy link",
    })
  }

  return (
    <div
      className={`bg-white rounded-3xl border border-border p-6 shadow-xs flex flex-col gap-5 ${className}`}
    >
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-xl font-bold text-gray-950 tracking-tight">
          {cd.currentClasses || "Current Classes"}
        </h3>

        <button
          type="button"
          onClick={() =>
            navigate("/workspace/classes/create-class", {
              state: { courseId },
            })
          }
          className="px-4 py-1.5 border border-[#b20a1c] hover:bg-red-50/50 text-[#b20a1c] text-xs font-bold rounded-full flex items-center gap-1.5 transition-all active:scale-95 shadow-xs cursor-pointer"
        >
          <span>{cd.addNewClass || "Add New Class"}</span>
          <span className="text-sm font-normal">+</span>
        </button>
      </div>

      {/* Class Cards List */}
      {classes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {classes.map((cls) => {
            const classKey = cls.id || cls._id
            return (
              <ClassCard
                key={classKey}
                cls={cls}
                isStudent={false}
                viewMode="grid"
                onClick={() =>
                  navigate(
                    `/workspace/courses/class/${encodeURIComponent(String(classKey))}`,
                  )
                }
                progressLabel={c.progress || "Progress"}
                courseTitle={courseData?.title}
                onShare={handleShareClass}
              />
            )
          })}
        </div>
      ) : (
        /* Empty state card */
        <div className="text-center py-8 px-4 text-gray-400 text-xs font-medium bg-gray-50/50 border border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-gray-100 flex items-center justify-center text-gray-400">
            <Pencil size={18} className="stroke-[1.8]" />
          </div>
          <div className="flex flex-col gap-0.5">
            <h4 className="font-bold text-sm text-gray-700">
              {cd.noClassesYet || "No classes created yet"}
            </h4>
            <p className="text-xs text-gray-400 font-medium max-w-[260px] leading-relaxed">
              {cd.startByAdding ||
                "Start by adding your first class to this course."}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default CurrentClassesSection
