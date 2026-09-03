import React, { useMemo } from "react"
import { SquareUserRound, Mail, Star, Medal, BookOpen } from "lucide-react"
import TeacherStatCard from "../../student/components/TeacherStatCard"
import { parseLanguages, getExperienceBadgeText } from "@/features/landing/utils/instructorUtils"

const TeacherInforCard = ({
  teacher = {},
  teacherAvatarUrl,
  rawCourse = {},
  classes = [],
  scd = {},
  handleContactTeacher,
  navigate,
  className = "",
}) => {
  const experienceBadge = useMemo(() => {
    const langs = parseLanguages(teacher.teachLanguages ?? teacher.languagesTeach ?? teacher.languages)
    return getExperienceBadgeText(langs, undefined, "vi")
  }, [teacher.teachLanguages, teacher.languagesTeach, teacher.languages])
  return (
    <div
      className={`rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col items-center justify-between bg-[linear-gradient(225deg,rgba(153,0,17,0.12)_0%,rgba(255,255,255,1)_60%)] relative overflow-hidden ${className}`}
    >
      <div className="w-full flex flex-col items-center">
        {/* Avatar + Name + Email card */}
        <div
          className="group cursor-pointer flex flex-col items-center transition-all duration-200"
          onClick={() => {
            const teacherId = teacher.accountId || teacher.id
            if (teacherId) {
              navigate(`/profile/${encodeURIComponent(String(teacherId))}`)
            }
          }}
        >
          {/* Avatar (lớn, căn giữa) */}
          {teacherAvatarUrl ? (
            <img
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover mx-auto transition-transform duration-200 group-hover:scale-105"
              src={teacherAvatarUrl}
              alt={teacher.name || ""}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-red-100 text-cath-red-700 flex items-center justify-center font-bold text-2xl sm:text-3xl border-4 border-white shadow-md mx-auto transition-transform duration-200 group-hover:scale-105">
              {(teacher.name || "T")[0]?.toUpperCase()}
            </div>
          )}

          {/* Name */}
          <h3 className="font-bold text-base sm:text-lg text-gray-900 group-hover:text-cath-red-700 transition-colors text-center mt-3">
            {teacher.name || scd.instructorUnavailable || "Giảng viên"}
          </h3>

          {/* Email */}
          <p className="text-xs text-gray-400 group-hover:text-cath-red-700 transition-colors font-normal text-center mt-0.5">
            {teacher.email ||
              teacher.contactEmail ||
              teacher.accountEmail ||
              teacher.title ||
              "teacher@catspeak.com"}
          </p>
          {experienceBadge && (
            <span className="inline-flex items-center bg-red-50 text-cath-red-700 text-[11px] font-bold px-2.5 py-1 rounded-full mt-2">
              {experienceBadge}
            </span>
          )}
        </div>

        {/* Padding bên dưới email */}
        <div className="w-full pt-3">
          {/* Cards thể hiện: rating, reviewCount (nếu >= 5), totalClasses */}
          <div className="flex items-center justify-center gap-2 w-full">
            {/* Rating */}
            {Number(teacher.totalReviews ?? teacher.reviewCount ?? 0) >= 5 && (
              <TeacherStatCard
                className="flex-1 min-w-0"
                title={scd.rating || "Đánh giá"}
                value={
                  teacher.rating ??
                  teacher.averageRating ??
                  rawCourse.rating ??
                  "5.0"
                }
                color="#f59e0b"
                icon={
                  <Star size={13} className="fill-amber-400 text-amber-400" />
                }
              />
            )}

            {/* Review Count */}

            <TeacherStatCard
              className="flex-1 min-w-0"
              title={scd.totalReviews || "Lượt đánh giá"}
              value={teacher.totalReviews ?? teacher.reviewCount}
              color="#8c65e0"
              icon={<Medal size={15} />}
            />

            {/* Total Classes */}
            <TeacherStatCard
              className="flex-1 min-w-0"
              title={scd.classesCount || "Lớp học"}
              value={
                teacher.totalClasses ??
                teacher.classCount ??
                classes.length ??
                0
              }
              color="#1c7dfc"
              icon={<BookOpen size={15} />}
            />
          </div>
        </div>

        {/* Introduction paragraph */}
        <p className="text-xs sm:text-sm text-gray-700 font-normal text-justify leading-relaxed mt-3.5 p-3 sm:p-3.5 bg-amber-50/90 border border-amber-100 rounded-2xl line-clamp-3 sm:line-clamp-4 w-full">
          {teacher.introduction ||
            teacher.bio ||
            teacher.description ||
            scd.defaultBio ||
            "Giảng viên tâm huyết với nhiều năm kinh nghiệm giảng dạy ngôn ngữ và phát triển kỹ năng cho học viên."}
        </p>
      </div>

      {/* Phía dưới cùng: 2 nút "<SquareUserRound /> Trang cá nhân" và nút liên hệ */}
      <div className="flex items-center gap-2.5 sm:gap-3 w-full mt-5 pt-1">
        <button
          type="button"
          onClick={() => {
            const teacherId = teacher.accountId || teacher.id
            if (teacherId) {
              navigate(`/profile/${encodeURIComponent(String(teacherId))}`)
            }
          }}
          disabled={!teacher.accountId && !teacher.id}
          className="flex-1 h-10 bg-gradient-to-r from-[#e3495b] to-[#f59aa5] hover:opacity-95 text-white text-xs sm:text-sm font-bold rounded-full flex items-center justify-center gap-1.5 sm:gap-2 transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
        >
          <SquareUserRound size={16} />
          <span>{scd.profileBtn || "Trang cá nhân"}</span>
        </button>

        <button
          type="button"
          onClick={handleContactTeacher}
          disabled={!teacher.accountId && !teacher.id}
          title={scd.messageTeacher || "Nhắn tin với giảng viên"}
          className="h-10 w-10 rounded-full border border-cath-red-700 hover:bg-red-50 text-cath-red-700 flex items-center justify-center shrink-0 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
        >
          <Mail size={17} />
        </button>
      </div>
    </div>
  )
}

export default TeacherInforCard
