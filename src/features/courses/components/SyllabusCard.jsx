import React from "react"

const SyllabusCard = ({ rawCourse, language }) => {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs flex flex-col gap-4">
      <h3 className="text-lg font-black text-gray-950 tracking-tight">
        {language === "vi" ? "Nội dung học tập" : "What You'll Learn"}
      </h3>
      <div className="flex flex-col gap-3.5">
        {(rawCourse.syllabus || [
          "Master daily communication skills & grammar nuances.",
          "Build native vocabulary for workplace scenarios.",
          "Improve speaking fluency and pronunciation checkmarks.",
          "Access study sheets and curated translation assets."
        ]).map((item, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <div className="w-5 h-5 shrink-0 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-xs mt-0.5 font-bold">
              ✓
            </div>
            <span className="text-xs text-gray-600 font-bold leading-relaxed">{item}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SyllabusCard
