import React from "react"
import { GraduationCap } from "lucide-react"

const InstructorEmptyState = ({ onApply, t }) => {
  const ins = t.profile?.instructor || {}

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-6">
        <GraduationCap className="w-10 h-10 text-[#990011]" />
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-2">
        {ins.notAppliedTitle}
      </h2>

      <p className="text-sm text-gray-500 max-w-md mb-8">
        {ins.notAppliedDescription}
      </p>

      <button
        type="button"
        onClick={onApply}
        className="px-8 py-2.5 bg-[#990011] text-white text-sm font-semibold rounded-lg hover:bg-[#7a000d] transition-colors"
      >
        {ins.applyNow}
      </button>
    </div>
  )
}

export default InstructorEmptyState
