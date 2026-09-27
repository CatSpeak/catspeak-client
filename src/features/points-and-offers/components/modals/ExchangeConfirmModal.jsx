import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Ticket, X, AlertCircle } from "lucide-react"

const ExchangeConfirmModal = ({
  isOpen,
  onClose,
  voucher,
  availablePoints = 0,
  onConfirm,
  simulationMode = "success",
  setSimulationMode,
}) => {
  if (!isOpen || !voucher) return null

  const cost = voucher.pointsRequired || 0
  const remaining = Math.max(0, availablePoints - cost)

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-[#990011]">
                <Ticket size={18} />
              </div>
              <h3 className="text-base font-bold text-gray-900">
                Xác nhận đổi Voucher
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 rounded-full p-1 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-5 pt-3 space-y-4">
            <p className="text-xs text-gray-500">
              Vui lòng kiểm tra lại thông tin trước khi xác nhận.
            </p>

            {/* Details Table */}
            <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100 text-xs sm:text-sm space-y-2.5">
              <div className="flex justify-between items-start gap-4">
                <span className="text-gray-500 shrink-0">Voucher</span>
                <span className="font-semibold text-gray-900 text-right">
                  {voucher.title}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Điểm hiện có</span>
                <span className="font-medium text-gray-800">
                  {availablePoints.toLocaleString("vi-VN")}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Điểm trừ</span>
                <span className="font-bold text-[#990011]">
                  -{cost.toLocaleString("vi-VN")}
                </span>
              </div>

              <div className="border-t border-gray-200/80 pt-2 flex justify-between items-center">
                <span className="font-semibold text-gray-700">Còn lại</span>
                <span className="font-bold text-emerald-600 text-base">
                  {remaining.toLocaleString("vi-VN")}
                </span>
              </div>
            </div>

            {/* Test Simulation Controls to preview all branches */}
            {setSimulationMode && (
              <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/60 text-xs">
                <div className="flex items-center gap-1.5 text-amber-800 font-medium mb-1.5">
                  <AlertCircle size={13} />
                  <span>Kịch bản kiểm thử:</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    type="button"
                    onClick={() => setSimulationMode("success")}
                    className={`px-2 py-1 rounded text-[11px] font-medium transition ${
                      simulationMode === "success"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Thành công
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimulationMode("error_network")}
                    className={`px-2 py-1 rounded text-[11px] font-medium transition ${
                      simulationMode === "error_network"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Lỗi kết nối
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimulationMode("error_out_of_stock")}
                    className={`px-2 py-1 rounded text-[11px] font-medium transition ${
                      simulationMode === "error_out_of_stock"
                        ? "bg-[#990011] text-white shadow-xs"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Lỗi hết quà
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => onConfirm()}
                className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-[#990011] hover:bg-[#85000f] active:bg-[#72000d] rounded-lg shadow-sm hover:shadow transition"
              >
                Xác nhận đổi
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default ExchangeConfirmModal
