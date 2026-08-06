import React from "react"
import { ShieldCheck, Star, Users, Award, BookOpen, CheckCircle } from "lucide-react"
import { getSafeMediaUrl } from "../../utils/courseUtils"

const PublicClassInstructor = ({ classData }) => {
  const teacher = classData?.teacher || {}
  const teacherName = teacher.fullName || teacher.name || teacher.title || "Chuyên Gia Ngôn Ngữ CatSpeak"
  const teacherTitle = teacher.title || "Giảng Viên Ngôn Ngữ Cao Cấp"
  const teacherAvatar = getSafeMediaUrl(teacher.avatar)
  const teacherBio = teacher.introduction || teacher.description ||
    "Giảng viên giàu kinh nghiệm huấn luyện giao tiếp phản xạ ngôn ngữ chuẩn quốc tế. Hơn 8 năm kinh nghiệm giảng dạy cho các doanh nghiệp và học viên trên toàn quốc."

  return (
    <div id="instructor" className="scroll-mt-24">
      <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight mb-6">
        Thông Tin Giảng Viên Chuyên Trách
      </h2>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Avatar */}
          <div className="shrink-0">
            {teacherAvatar ? (
              <img
                src={teacherAvatar}
                alt={teacherName}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-4 ring-rose-100 shadow-md"
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-[#b20a1c] to-rose-700 text-white font-black text-3xl flex items-center justify-center shadow-md">
                {teacherName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Teacher Info & Stats */}
          <div className="flex-1 flex flex-col gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#b20a1c] uppercase tracking-wider mb-1">
                <ShieldCheck size={15} />
                Giảng Viên Xác Thực Bởi CatSpeak
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                {teacherName}
              </h3>
              <p className="text-sm font-semibold text-slate-500">
                {teacherTitle}
              </p>
            </div>

            {/* Quick Instructor Metrics */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-700 py-2 border-y border-slate-100">
              <div className="flex items-center gap-1 text-amber-500">
                <Star size={14} className="fill-amber-400" />
                <span>4.9 Đánh giá giảng viên</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1 text-slate-600">
                <Users size={14} />
                <span>1,200+ Học viên</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1 text-slate-600">
                <BookOpen size={14} />
                <span>15+ Lớp đã giảng dạy</span>
              </div>
            </div>

            {/* Bio */}
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              {teacherBio}
            </p>

            {/* Teaching badges */}
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-md">
                <CheckCircle size={12} /> Chứng chỉ TESOL / CELTA
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-blue-700 bg-blue-50 border border-blue-200/60 px-2.5 py-1 rounded-md">
                <CheckCircle size={12} /> Tương tác 1:1 trực tiếp
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PublicClassInstructor
