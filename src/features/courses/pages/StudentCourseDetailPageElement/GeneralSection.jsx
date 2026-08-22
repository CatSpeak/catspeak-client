import React from "react"
import { Check, Share2 } from "lucide-react"

const GeneralSection = ({
  rawCourse = {},
  thumbnailUrl,
  defaultCourseThumbnail,
  linkCopied = false,
  handleCopyLink,
  scd = {},
  className = "",
}) => {
  return (
    <div
      className={`bg-white rounded-3xl p-4 sm:p-6 flex flex-col items-center shadow-xs ${className}`}
    >
      <div className="w-full flex flex-col items-center">
        {/* Header: Title & Nút Share */}
        <div className="relative w-full flex items-center justify-center min-h-[44px]">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-cath-red-700 text-center px-12 leading-snug">
            {rawCourse?.title}
          </h1>
          <button
            type="button"
            onClick={handleCopyLink}
            title={scd.shareCourse || "Chia sẻ khóa học"}
            className="absolute right-0 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all active:scale-90 cursor-pointer shrink-0"
          >
            {linkCopied ? (
              <Check size={18} className="text-green-600" />
            ) : (
              <Share2 size={18} />
            )}
          </button>
        </div>

        {/* ThumbnailUrl */}
        <div className="w-full flex justify-center mt-5">
          <img
            src={thumbnailUrl || defaultCourseThumbnail}
            alt={rawCourse?.title || "Course thumbnail"}
            className="w-full max-w-lg aspect-video object-cover rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm block"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    </div>
  )
}

export default GeneralSection
