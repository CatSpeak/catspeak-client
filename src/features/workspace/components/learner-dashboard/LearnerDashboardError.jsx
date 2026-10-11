import React from "react"
import { AlertCircle, RefreshCw } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"

const LearnerDashboardError = ({ message, onRetry }) => {
  const { language } = useLanguage()
  const isEn = language === "en"

  return (
    <div
      role="alert"
      className="w-full bg-white border border-rose-200 rounded-xl p-8 text-center flex flex-col items-center justify-center my-8 shadow-xs"
    >
      <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>

      <h2 className="text-base sm:text-lg font-bold text-[#14171F]">
        {isEn ? "Unable to Load Dashboard" : "Không thể tải dữ liệu Bảng điều khiển"}
      </h2>

      <p className="text-xs sm:text-sm text-[#6E788C] mt-1 max-w-md">
        {message || (isEn
          ? "A temporary system or connection error occurred. Please try again."
          : "Đã xảy ra lỗi tạm thời khi đồng bộ dữ liệu của học viên. Vui lòng tải lại trang.")}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#72000D] hover:bg-[#85000F] active:bg-[#5E000A] rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{isEn ? "Retry" : "Thử lại"}</span>
        </button>
      )}
    </div>
  )
}

export default LearnerDashboardError
