import React from "react"
import { SquareUserRound, Mail, Star, Medal, BookOpen } from "lucide-react"
import TeacherStatCard from "../../student/components/TeacherStatCard"

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
  return (
    <div
      className={`rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col items-center justify-between bg-[linear-gradient(225deg,rgba(153,0,17,0.12)_0%,rgba(255,255,255,1)_60%)] relative overflow-hidden ${className}`}
    >
      <div className="w-full flex flex-col items-center">
        {/* Avatar (lớn, căn giữa) */}
        {teacherAvatarUrl ? (
          <img
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover mx-auto"
            src={teacherAvatarUrl}
            alt={teacher.name || ""}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-red-100 text-cath-red-700 flex items-center justify-center font-bold text-2xl sm:text-3xl border-4 border-white shadow-md mx-auto">
            {(teacher.name || "T")[0]?.toUpperCase()}
          </div>
        )}

        {/* Name */}
        <h3 className="font-bold text-base sm:text-lg text-gray-900 text-center mt-3">
          {teacher.name || scd.instructorUnavailable || "Giảng viên"}
        </h3>

        {/* Email */}
        <p className="text-xs text-gray-400 font-normal text-center mt-0.5">
          {teacher.email ||
            teacher.contactEmail ||
            teacher.accountEmail ||
            teacher.title ||
            "teacher@catspeak.com"}
        </p>

        {/* Padding bên dưới email */}
        <div className="w-full pt-3">
          {/* 3 cards thể hiện: rating, reviewCount, totalClasses */}
          {(() => {
            const rawReviews = Number(
              teacher.reviewCount ??
              teacher.totalReviews ??
              rawCourse.reviewCount ??
              0
            )
            const displayReviews = rawReviews >= 5 ? rawReviews : "—"

            return (
              <div className="grid grid-cols-3 gap-2 w-full">
                {/* Rating */}
                <TeacherStatCard
                  title="Đánh giá"
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

                {/* Review Count */}
                <TeacherStatCard
                  title="Lượt đánh giá"
                  value={displayReviews}
                  color="#8c65e0"
                  icon={<Medal size={15} />}
                />

                {/* Total Classes */}
                <TeacherStatCard
                  title="Lớp học"
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
            )
          })()}
        </div>

        {/* Introduction paragraph */}
        <p className="text-xs sm:text-sm text-gray-700 font-normal text-justify leading-relaxed mt-3.5 p-3 sm:p-3.5 bg-amber-50/90 border border-amber-100 rounded-2xl line-clamp-3 sm:line-clamp-4 w-full">
          {teacher.introduction ||
            teacher.bio ||
            teacher.description ||
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
          <span>Trang cá nhân</span>
        </button>

        <button
          type="button"
          onClick={handleContactTeacher}
          disabled={!teacher.accountId && !teacher.id}
          title="Nhắn tin với giảng viên"
          className="h-10 w-10 rounded-full border border-cath-red-700 hover:bg-red-50 text-cath-red-700 flex items-center justify-center shrink-0 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
        >
          <Mail size={17} />
        </button>
      </div>
    </div>
  )
}

export default TeacherInforCard
