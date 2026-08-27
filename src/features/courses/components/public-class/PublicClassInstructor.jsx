import React from "react"
import { useNavigate } from "react-router-dom"
import { BadgeCheck } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { getSafeMediaUrl } from "../../utils/courseUtils"

const PublicClassInstructor = ({ classData }) => {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const c = t.courses || {}
  const pc = c.publicClass || {}

  const teacher = classData?.teacher || {}
  const teacherName =
    teacher.fullName ||
    teacher.name ||
    teacher.title ||
    c.defaultInstructor ||
    "CatSpeak Instructor"
  const teacherTitle = teacher.title || ""
  const teacherAvatar = getSafeMediaUrl(
    teacher.avatar || teacher.avatarImageUrl || teacher.avatarUrl,
  )
  const teacherBio =
    teacher.introduction ||
    teacher.description ||
    pc.defaultTeacherBio ||
    "Giảng viên giàu kinh nghiệm huấn luyện giao tiếp phản xạ ngôn ngữ chuẩn quốc tế. Hơn 8 năm kinh nghiệm giảng dạy cho các doanh nghiệp và học viên trên toàn quốc."

  return (
    <div id="instructor" className="scroll-mt-24">
      <h2 className="text-lg sm:text-xl font-bold text-slate-950 tracking-tight mb-3">
        {pc.instructorTitle || "Thông tin giảng viên"}
      </h2>

      <div
        style={{
          background:
            "linear-gradient(15deg,rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.67) 29%, rgba(194, 14, 35, 0.07) 87%, rgba(194, 14, 35, 0.15) 100%)",
        }}
        className="border border-border rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col gap-4"
      >
        {/* Avatar + Teacher Info (Clickable Block) */}
        <div
          className="group cursor-pointer flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6 w-fit transition-all duration-200"
          onClick={() => {
            const teacherId = teacher.accountId || teacher.id
            if (teacherId) {
              navigate(`/profile/${encodeURIComponent(String(teacherId))}`)
            }
          }}
        >
          {/* Avatar */}
          <div className="shrink-0">
            {teacherAvatar ? (
              <img
                src={teacherAvatar}
                alt={teacherName}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover shadow-md transition-transform duration-200 group-hover:scale-105"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[#b20a1c] to-rose-700 text-white font-bold text-2xl sm:text-3xl flex items-center justify-center shadow-md transition-transform duration-200 group-hover:scale-105">
                {teacherName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Teacher Name & Title */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-[#b20a1c] group-hover:text-cath-red-700 transition-colors tracking-wider mb-1">
              <BadgeCheck size={20} />
              {pc.verifiedTeacher || "Giảng viên được xác minh bởi Catspeak"}
            </div>
            <h3 className="font-bold text-slate-900 group-hover:text-cath-red-700 transition-colors leading-tight">
              {teacherName}
            </h3>
            {teacherTitle && (
              <p className="text-xs font-semibold text-slate-500 group-hover:text-cath-red-700 transition-colors">
                {teacherTitle}
              </p>
            )}
            <p className="text-slate-600 leading-relaxed text-justify">
              {teacherBio}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PublicClassInstructor
