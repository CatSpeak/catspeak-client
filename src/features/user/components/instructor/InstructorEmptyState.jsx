import React from "react"
import PillButton from "@/shared/components/ui/buttons/PillButton"

const InstructorEmptyState = ({ onApply, t }) => {
  const ins = t.profile?.instructor || {}

  return (
    <div className="flex flex-col items-center justify-center p-10 bg-white rounded-2xl shadow-sm border border-gray-100 text-center mt-4">
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cath-red-700">
          <path d="M12 20h9"></path>
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 Z"></path>
        </svg>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-2">
        {ins.notAppliedTitle || "Bạn chưa đăng ký"}
      </h2>

      <p className="text-sm text-gray-500 max-w-md mb-8 leading-relaxed">
        {ins.notAppliedDescription || "Chia sẻ chuyên môn của bạn với học viên trên toàn thế giới. Đăng ký trở thành giảng viên và bắt đầu giảng dạy ngay hôm nay."}
      </p>

      <PillButton onClick={onApply} className="px-8">
        {ins.applyNow || "Đăng ký ngay"}
      </PillButton>
    </div>
  )
}

export default InstructorEmptyState
