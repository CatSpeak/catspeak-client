import React from "react"
import { motion as Motion, AnimatePresence } from "framer-motion"
import { useLanguage } from "@/shared/context/LanguageContext"

const ExchangeProcessingModal = ({ isOpen }) => {
  const { t } = useLanguage()
  const pt = t.pointsAndOffers || {}
  const pr = pt.modals?.processing || {}

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs"
        />

        {/* Modal Dialog */}
        <Motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center justify-center text-center z-10"
        >
          {/* Animated Spinner with gradient accent */}
          <div className="relative w-16 h-16 mb-5 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border-4 border-rose-100 border-t-[#990011] animate-spin" />
          </div>

          <h3 className="text-base font-bold text-gray-900 mb-1">
            {pr.title || "Đang xử lý đổi voucher..."}
          </h3>
          <p className="text-xs text-gray-500">
            {pr.subtitle || "Vui lòng đợi trong giây lát và không đóng cửa sổ này"}
          </p>
        </Motion.div>
      </div>
    </AnimatePresence>
  )
}

export default ExchangeProcessingModal
