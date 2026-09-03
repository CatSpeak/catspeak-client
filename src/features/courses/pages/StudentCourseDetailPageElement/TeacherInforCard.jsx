import React, { useMemo } from "react"
import { SquareUserRound, Mail, Star, Medal, BookOpen } from "lucide-react"
import { parseLanguages, getLanguageExperienceList } from "@/features/landing/utils/instructorUtils"

const statBoxClass =
  "flex-1 min-w-0 px-2 py-2 bg-white shadow-[0px_1px_4px_rgba(12,12,13,0.05),0px_1px_4px_rgba(12,12,13,0.10)] rounded-xl flex flex-col justify-center items-center gap-1.5"

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
  const teacherId = teacher.accountId || teacher.id
  const goToProfile = () => {
    if (teacherId) {
      navigate(`/profile/${encodeURIComponent(String(teacherId))}`)
    }
  }

  // Năm KN theo đúng ngôn ngữ của lớp/khóa đang xem (Q3); thiếu thì ẩn ô (Q8a).
  const courseLanguage = useMemo(() => {
    const raw =
      rawCourse.language || rawCourse.Language || classes[0]?.language || classes[0]?.Language || ""
    return String(raw).trim().toLowerCase()
  }, [rawCourse.language, rawCourse.Language, classes])

  const yearsExperience = useMemo(() => {
    const langs = parseLanguages(teacher.teachLanguages ?? teacher.languagesTeach ?? teacher.languages)
    const list = getLanguageExperienceList(langs)
    if (list.length === 0 || !courseLanguage) return null
    const match = list.find((x) => String(x.language || "").trim().toLowerCase() === courseLanguage)
    return match ? match.yearsExperience : null
  }, [teacher.teachLanguages, teacher.languagesTeach, teacher.languages, courseLanguage])

  const showRating = Number(teacher.totalReviews ?? teacher.reviewCount ?? 0) >= 5
  const ratingValue = teacher.rating ?? teacher.averageRating ?? rawCourse.rating ?? "5.0"
  const taughtCount = teacher.totalClasses ?? teacher.classCount ?? classes.length ?? 0

  return (
    <div
      className={`rounded-3xl p-5 shadow-sm flex flex-col items-center gap-4 bg-[linear-gradient(44deg,white_1%,white_35%,#F5DBDB_100%)] relative overflow-hidden ${className}`}
    >
      {/* Avatar + Name + handle */}
      <div className="w-36 flex flex-col items-center gap-1">
        <div
          className="group cursor-pointer flex flex-col items-center gap-1"
          onClick={goToProfile}
        >
          {teacherAvatarUrl ? (
            <img
              className="w-[106px] h-[106px] rounded-full object-cover transition-transform duration-200 group-hover:scale-105"
              src={teacherAvatarUrl}
              alt={teacher.name || ""}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="w-[106px] h-[106px] rounded-full bg-red-100 text-cath-red-700 flex items-center justify-center font-bold text-3xl border-4 border-white shadow-md transition-transform duration-200 group-hover:scale-105">
              {(teacher.name || "T")[0]?.toUpperCase()}
            </div>
          )}
          <div className="self-stretch flex flex-col items-center gap-1">
            <h3 className="self-stretch text-center text-black text-sm font-semibold leading-[19.6px] break-words">
              {teacher.name || scd.instructorUnavailable || "Giảng viên"}
            </h3>
            <p className="self-stretch text-center text-[#7B7979] text-xs font-normal leading-[16.8px] break-words">
              {teacher.email ||
                teacher.contactEmail ||
                teacher.accountEmail ||
                teacher.title ||
                "teacher@catspeak.com"}
            </p>
          </div>
        </div>
      </div>

      {/* Stat boxes */}
      <div className="self-stretch flex justify-between items-stretch gap-2">
        {showRating && (
          <div className={statBoxClass}>
            <div className="w-9 h-9 p-1 bg-[#FFF3C6] rounded-full flex justify-center items-center overflow-hidden">
              <Star size={18} className="fill-[#F4AB1B] text-[#F4AB1B]" />
            </div>
            <div className="text-black text-lg font-medium leading-[25.2px] break-words">{ratingValue}</div>
            <div className="text-[#7B7979] text-xs font-normal leading-[16.8px] break-words">
              {scd.rating || "Đánh giá"}
            </div>
          </div>
        )}

        {yearsExperience !== null && (
          <div className={statBoxClass}>
            <div className="w-9 h-9 p-1 bg-[#E3D7FF] rounded-full flex justify-center items-center overflow-hidden">
              <Medal size={18} className="text-[#8C65E1]" />
            </div>
            <div className="text-black text-lg font-medium leading-[25.2px] break-words">{yearsExperience}</div>
            <div className="text-[#7B7979] text-xs font-normal leading-[16.8px] break-words">
              {scd.yearsExperience || "Năm KN"}
            </div>
          </div>
        )}

        <div className={statBoxClass}>
          <div className="w-9 h-9 p-1 bg-[#BFDBFF] rounded-full flex justify-center items-center overflow-hidden">
            <BookOpen size={18} className="text-[#1D7DFD]" />
          </div>
          <div className="text-black text-lg font-medium leading-[25.2px] break-words">{taughtCount}</div>
          <div className="text-[#7B7979] text-xs font-normal leading-[16.8px] break-words">
            {scd.classesCount || "Khóa đã dạy"}
          </div>
        </div>
      </div>

      {/* Introduction */}
      <div className="self-stretch p-2.5 bg-[#FFFBEA] rounded-xl outline outline-[0.2px] outline-[#FFE47C] outline-offset-[-0.2px] flex justify-center items-center gap-2.5">
        <p className="text-black text-xs font-normal leading-[16.8px] break-words line-clamp-4">
          {teacher.introduction ||
            teacher.bio ||
            teacher.description ||
            scd.defaultBio ||
            "Giảng viên tâm huyết với nhiều năm kinh nghiệm giảng dạy ngôn ngữ và phát triển kỹ năng cho học viên."}
        </p>
      </div>

      {/* Actions */}
      <div className="self-stretch flex justify-start items-center gap-5">
        <button
          type="button"
          onClick={goToProfile}
          disabled={!teacherId}
          className="flex-1 px-3 py-2 bg-[linear-gradient(129deg,#DD2E41_0%,#F7A0AA_100%)] rounded-[20px] flex justify-center items-center gap-2.5 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
        >
          <SquareUserRound size={20} className="text-[#F5F5F5]" />
          <span className="text-[#F5F5F5] text-xs font-normal leading-[16.8px] break-words">
            {scd.profileBtn || "Trang cá nhân"}
          </span>
        </button>

        <button
          type="button"
          onClick={handleContactTeacher}
          disabled={!teacherId}
          title={scd.messageTeacher || "Nhắn tin với giảng viên"}
          className="w-7 h-7 p-2 rounded-full outline outline-1 outline-[#990011] outline-offset-[-1px] flex justify-center items-center gap-2.5 transition-all hover:bg-red-50 active:scale-95 cursor-pointer disabled:opacity-50"
        >
          <Mail size={12} className="text-[#990011]" />
        </button>
      </div>
    </div>
  )
}

export default TeacherInforCard
