import React from "react"
import { useNavigate } from "react-router-dom"
import { Lock } from "lucide-react"
import Modal from "@/shared/components/ui/Modal"

const QuotaLockedModal = ({
  isOpen,
  onClose,
  topicTitle = "Gọi món ăn",
}) => {
  const navigate = useNavigate()

  if (!isOpen) return null

  const handleUpgrade = () => {
    onClose?.()
    navigate("/pricing")
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      fullScreenOnMobile={false}
      className="md:max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl"
    >
      <div className="p-7 sm:p-8 flex flex-col items-center text-center">
        {/* Soft pink capsule with Lock icon matching Figma screen 03 */}
        <div className="w-12 h-14 bg-[#FFF0F2] rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#980019]">
          <Lock className="w-6 h-6 stroke-[2]" />
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Hết lượt Free hôm nay
        </h3>

        {/* Description */}
        <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-[340px] mx-auto mb-6">
          Bạn đã dùng 2/2 lượt luyện nói miễn phí. Buổi "{topicTitle}" được giữ nguyên — không tính là lỡ buổi.
        </p>

        {/* Action Buttons Row */}
        <div className="flex items-center justify-center gap-3 w-full">
          <button
            type="button"
            onClick={handleUpgrade}
            className="bg-[#980019] text-white hover:bg-[#800014] rounded-xl px-6 py-2.5 font-medium text-xs sm:text-sm transition-colors shadow-xs"
          >
            Nâng cấp Premium
          </button>

          <button
            type="button"
            onClick={onClose}
            className="text-xs sm:text-sm text-gray-700 hover:text-gray-900 font-medium px-4 py-2.5 transition-colors cursor-pointer"
          >
            Để mai học
          </button>
        </div>

        {/* Subtext */}
        <p className="text-[11px] text-gray-400 mt-5">
          Premium: luyện nói không giới hạn · mở khóa mọi chủ đề
        </p>
      </div>
    </Modal>
  )
}

export default QuotaLockedModal
