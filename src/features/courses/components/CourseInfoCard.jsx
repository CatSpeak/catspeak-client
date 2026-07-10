import React from "react"
import { Globe, GraduationCap, Calendar, Clock, AlignLeft } from "lucide-react"

const CourseInfoCard = ({
  courseData,
  languageLabel,
  levelLabel,
  admissionPeriodLabel,
  durationLabel,
  descriptionLabel
}) => {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

        {/* Ngôn ngữ */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 shrink-0 rounded-full bg-[#EFF6FF] text-[#3B82F6] flex items-center justify-center">
            <Globe size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 font-bold">{languageLabel}</span>
            <span className="text-gray-900 font-extrabold text-sm mt-0.5">{courseData.language}</span>
          </div>
        </div>

        {/* Trình độ */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 shrink-0 rounded-full bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
            <GraduationCap size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 font-bold">{levelLabel}</span>
            <span className="inline-flex mt-1 items-center justify-center px-3 py-0.5 text-xs font-black text-white bg-[#EAB308] rounded-full w-fit">
              {courseData.level}
            </span>
          </div>
        </div>

        {/* Thời gian tuyển sinh */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 shrink-0 rounded-full bg-[#E8F8F0] text-[#15803D] flex items-center justify-center">
            <Calendar size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 font-bold">{admissionPeriodLabel}</span>
            <span className="text-gray-900 font-extrabold text-sm mt-0.5">{courseData.admissionPeriod}</span>
          </div>
        </div>

        {/* Thời lượng */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 shrink-0 rounded-full bg-[#FFE4E6] text-[#E11D48] flex items-center justify-center">
            <Clock size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 font-bold">{durationLabel}</span>
            <span className="text-gray-900 font-extrabold text-sm mt-0.5">{courseData.duration}</span>
          </div>
        </div>

      </div>

      {/* Mô tả */}
      <div className="flex items-start gap-3 border-t border-gray-100 pt-6">
        <div className="w-10 h-10 shrink-0 rounded-full bg-[#F3F4F6] text-[#4B5563] flex items-center justify-center">
          <AlignLeft size={18} />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-400 font-bold">{descriptionLabel}</span>
          <p className="text-gray-600 font-medium text-xs leading-relaxed mt-0.5">
            {courseData.description}
          </p>
        </div>
      </div>
    </div>
  )
}

export default CourseInfoCard
