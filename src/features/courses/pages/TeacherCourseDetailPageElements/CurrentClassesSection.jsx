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
    <div className={`flex flex-col gap-5 ${className}`}>
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-black text-gray-950 tracking-tight">
          {cd.currentClasses || "Current Classes"}
        </h3>

        <button
          type="button"
          onClick={() =>
            navigate("/workspace/classes/create-class", {
              state: { courseId },
            })
          }
          className="px-4 py-1.5 border border-[#b20a1c] hover:bg-red-50/50 text-[#b20a1c] text-xs font-black rounded-full flex items-center gap-1.5 transition-all active:scale-95 shadow-sm cursor-pointer"
        >
          <span>{cd.addNewClass || "Add New Class"}</span>
          <span className="text-sm font-light">+</span>
        </button>
      </div>

      {/* Class Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {classes.length > 0 ? (
          classes.map((cls) => {
            const classKey = cls.id || cls._id
            return (
              <ClassCard
                key={classKey}
                cls={cls}
                isStudent={false}
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
          })
        ) : (
          /* Empty state card */
          <div className="bg-[#FCFCFC] border border-border rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-4 min-h-[220px] col-span-2">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
              <Pencil size={24} className="stroke-[1.5]" />
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="font-extrabold text-sm text-gray-800">
                {cd.noClassesYet || "No classes created yet"}
              </h4>
              <p className="text-xs text-gray-400 font-bold max-w-[240px] leading-relaxed">
                {cd.startByAdding ||
                  "Start by adding your first class to this course."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CurrentClassesSection
