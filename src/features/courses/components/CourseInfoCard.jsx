import React from "react"
import { Globe, AlignLeft } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import RenderHTML from "@/shared/components/ui/RenderHTML"
import { getLocalizedLanguageName } from "../data/courseFormOptions"

const CourseInfoCard = ({
  courseData,
  languageLabel,
  descriptionLabel,
  noDescriptionText,
}) => {
  const { t } = useLanguage()
  const resolvedNoDescription = noDescriptionText
    || t.courses?.courseDetail?.noDescription
    || "No description provided."

  return (
    <div className="bg-white rounded-3xl border border-border p-6 shadow-xs flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

        {/* Ngôn ngữ */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 shrink-0 rounded-full bg-[#EFF6FF] text-[#3B82F6] flex items-center justify-center">
            <Globe size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-400 font-bold">{languageLabel}</span>
            <span className="text-gray-900 font-extrabold text-sm mt-0.5">
              {getLocalizedLanguageName(courseData.language, t)}
            </span>
          </div>
        </div>
      </div>

      {/* Mô tả */}
      <div className="flex items-start gap-3 border-t border-border pt-6">
        <div className="w-10 h-10 shrink-0 rounded-full bg-[#F3F4F6] text-[#4B5563] flex items-center justify-center">
          <AlignLeft size={18} />
        </div>
        <div className="flex flex-col gap-1 w-full min-w-0">
          <span className="text-sm text-gray-400 font-bold">{descriptionLabel}</span>
          <RenderHTML
            html={courseData.description}
            className="text-gray-600 font-medium text-sm leading-relaxed"
            fallback={<span className="text-gray-600 font-medium text-sm leading-relaxed">{resolvedNoDescription}</span>}
          />
        </div>
      </div>
    </div>
  )
}

export default CourseInfoCard
