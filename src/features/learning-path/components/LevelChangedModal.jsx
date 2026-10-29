import React, { useState } from "react"
import {
  GraduationCap,
  AlertCircle,
  Check,
  Sparkles,
  ArrowRight,
} from "lucide-react"
import Modal from "@/shared/components/ui/Modal"

const HSK_LEVELS = [
  {
    level: "HSK 1",
    title: "HSK 1 (Sơ cấp 1)",
    desc: "Bắt đầu từ con số 0, làm quen phiên âm Pinyin và chào hỏi cơ bản.",
    isAvailable: true,
  },
  {
    level: "HSK 2",
    title: "HSK 2 (Sơ cấp 2)",
    desc: "Giao tiếp sinh hoạt hàng ngày, mua sắm, hỏi đường, đặt đồ ăn.",
    isAvailable: true,
  },
  {
    level: "HSK 3",
    title: "HSK 3 (Trung cấp 1)",
    desc: "Hội thoại phản xạ, diễn đạt cảm xúc, chia sẻ công việc và đời sống.",
    isAvailable: true,
  },
  {
    level: "HSK 4",
    title: "HSK 4 (Trung cấp 2)",
    desc: "Thảo luận chuyên sâu, trình bày quan điểm về văn hóa và xã hội.",
    isAvailable: false,
  },
  {
    level: "HSK 5",
    title: "HSK 5 (Cao cấp 1)",
    desc: "Tự do diễn đạt ý tưởng phức tạp, đọc hiểu và phản biện lưu loát.",
    isAvailable: false,
  },
  {
    level: "HSK 6",
    title: "HSK 6 (Cao cấp 2)",
    desc: "Làm chủ tiếng Trung như người bản xứ trong mọi bối cảnh học thuật.",
    isAvailable: false,
  },
]

const LevelChangedModal = ({
  isOpen,
  onClose,
  currentLevel = "HSK 2",
  onConfirmLevelChange,
  isLoading = false,
}) => {
  const [prevCurrentLevel, setPrevCurrentLevel] = useState(currentLevel)
  const [selectedLevel, setSelectedLevel] = useState(currentLevel)

  if (currentLevel !== prevCurrentLevel) {
    setPrevCurrentLevel(currentLevel)
    setSelectedLevel(currentLevel)
  }

  if (!isOpen) return null

  const handleConfirm = () => {
    if (selectedLevel && selectedLevel !== currentLevel && onConfirmLevelChange) {
      onConfirmLevelChange(selectedLevel)
    }
  }

  const isCurrentOrUnavailable =
    selectedLevel === currentLevel ||
    !HSK_LEVELS.find((l) => l.level === selectedLevel)?.isAvailable

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      fullScreenOnMobile={false}
      className="md:max-w-xl bg-white dark:bg-gray-850 rounded-3xl overflow-hidden shadow-2xl"
    >
      <div className="p-6 sm:p-7 flex flex-col gap-5">
        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cath-red-600 to-cath-red-800 flex items-center justify-center text-white shadow-md shadow-cath-red-500/20 flex-shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Đổi trình độ HSK
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Chọn trình độ phù hợp với năng lực giao tiếp hiện tại của bạn
            </p>
          </div>
        </div>

        {/* Warning Notice Box */}
        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Lưu ý quan trọng:</strong> Khi đổi trình độ, chu kỳ hiện tại
            sẽ được lưu lại và một chu kỳ mới 5 ngày sẽ bắt đầu ngay từ hôm nay.
          </p>
        </div>

        {/* Level Options List */}
        <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-1">
          {HSK_LEVELS.map((item) => {
            const isSelected = selectedLevel === item.level
            const isCurrent = currentLevel === item.level

            return (
              <div
                key={item.level}
                onClick={() => setSelectedLevel(item.level)}
                className={`relative flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-cath-red-50/50 dark:bg-cath-red-950/20 border-cath-red-600 ring-2 ring-cath-red-500/20"
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <div className="flex items-start gap-3 pr-2">
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      isSelected
                        ? "bg-cath-red-600 border-cath-red-600 text-white"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-900 dark:text-white">
                        {item.title}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                          Hiện tại
                        </span>
                      )}
                      {!item.isAvailable && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          Sắp ra mắt
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Hủy bỏ
          </button>

          <button
            type="button"
            disabled={isLoading || isCurrentOrUnavailable}
            onClick={handleConfirm}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cath-red-700 via-cath-red-600 to-cath-red-700 hover:brightness-110 shadow-md shadow-cath-red-600/20 active:scale-95 disabled:opacity-50 transition-all"
          >
            <span>{isLoading ? "Đang cập nhật..." : "Xác nhận đổi trình độ"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default LevelChangedModal
