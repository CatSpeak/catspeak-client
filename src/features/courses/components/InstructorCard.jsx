import React from "react"
import { MessageSquare } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"

const InstructorCard = ({ rawCourse, onContact }) => {
  const { t } = useLanguage()
  const c = t.courses || {}

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs flex flex-col gap-5">
      <h3 className="text-lg font-black text-gray-950 tracking-tight">
        {c.student?.courseInstructor || "Course Instructor"}
      </h3>
      <div className="flex items-center gap-4">
        <img
          className="w-14 h-14 rounded-full object-cover border border-gray-100"
          src={rawCourse.instructor?.avatar || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=120&h=120"}
          alt={rawCourse.instructor?.fullName || "Instructor"}
        />
        <div className="flex flex-col">
          <h4 className="font-extrabold text-gray-950 text-base">{rawCourse.instructor?.fullName || "Prof. Sarah Jenkins"}</h4>
          <span className="text-xs text-[#990011] font-black">{rawCourse.instructor?.title || "Senior Language Coach"}</span>
        </div>
      </div>
      <p className="text-xs text-gray-550 font-semibold leading-relaxed">
        {rawCourse.instructor?.bio || "Expert in custom curriculum development with over 8 years of native tutoring experience."}
      </p>
      <button
        onClick={onContact}
        className="mt-2 w-full h-9 border border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-800 text-xs font-black rounded-full flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95"
      >
        <MessageSquare size={13} />
        <span>{c.student?.contactInstructor || "Contact Instructor"}</span>
      </button>
    </div>
  )
}

export default InstructorCard
