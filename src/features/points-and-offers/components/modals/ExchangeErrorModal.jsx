import React from "react"
import { motion as Motion, AnimatePresence } from "framer-motion"
import { WifiOff, PackageX } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"

const ExchangeErrorModal = ({
  isOpen,
  errorType = "network", // "network" | "out_of_stock"
  errorCode = "ERR-CONNECT-FAIL",
  onClose,
  onRetry,
  onChooseAnother,
}) => {
  const { t } = useLanguage()
  const pt = t.pointsAndOffers || {}
  const er = pt.modals?.error || {}

  if (!isOpen) return null

  const isNetwork = errorType === "network"
  const errorCodeText = er.errorCode
    ? er.errorCode.replace("{{code}}", errorCode || "ERR-CONNECT-FAIL")
    : `Mã lỗi: ${errorCode || "ERR-CONNECT-FAIL"}`

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs"
        />

        {/* Modal Dialog */}
        <Motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 sm:p-7 flex flex-col items-center text-center z-10"
        >
          {isNetwork ? (
            <>
              {/* Network Disconnect Icon in Light Blue */}
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 mb-4 shadow-xs">
                <WifiOff size={28} />
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-1.5">
                {er.networkTitle || "Không thể kết nối"}
              </h3>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                {er.networkDesc || "Có lỗi kỹ thuật hoặc mất kết nối mạng. Điểm của bạn không bị trừ. Vui lòng thử lại sau."}
              </p>

              <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5 text-[11px] font-mono text-gray-500 mb-6">
                {errorCodeText}
              </div>

              <div className="w-full grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-3 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition cursor-pointer"
                >
                  {er.closeBtn || "Đóng"}
                </button>
                <button
                  type="button"
                  onClick={onRetry}
                  className="py-2.5 px-3 text-xs sm:text-sm font-semibold text-white bg-[#990011] hover:bg-[#85000f] rounded-xl shadow-xs transition cursor-pointer"
                >
                  {er.retryBtn || "Thử lại"}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Out of Stock Empty Chest/Box in Light Amber */}
              <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 mb-4 shadow-xs">
                <PackageX size={28} />
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-1.5">
                {er.outOfStockTitle || "Ưu đãi vừa hết lượt"}
              </h3>
              <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                {er.outOfStockDesc || "Rất tiếc, Voucher này đã hết lượt quy đổi trong khi bạn xác nhận! Điểm của bạn không bị trừ."}
              </p>

              <div className="w-full grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-3 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition cursor-pointer"
                >
                  {er.closeBtn || "Đóng"}
                </button>
                <button
                  type="button"
                  onClick={onChooseAnother || onClose}
                  className="py-2.5 px-3 text-xs sm:text-sm font-semibold text-white bg-[#990011] hover:bg-[#85000f] rounded-xl shadow-xs transition cursor-pointer"
                >
                  {er.chooseAnotherBtn || "Chọn ưu đãi khác"}
                </button>
              </div>
            </>
          )}
        </Motion.div>
      </div>
    </AnimatePresence>
  )
}

export default ExchangeErrorModal
