import React from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  Sparkles,
  Compass,
  ArrowRight,
  GraduationCap,
  MessageCircle,
  RotateCcw,
} from "lucide-react"

const ComingSoonPage = ({
  hskLevel = "HSK 4",
  onChangeLevel,
  onOpenLevelModal,
  isChangingLevel = false,
}) => {
  const navigate = useNavigate()
  const { lang } = useParams()
  const currentLang = lang || "zh"

  const availableLevels = [
    { level: "HSK 1", label: "HSK 1 - Sơ cấp 1", desc: "Bắt đầu làm quen âm điệu & chào hỏi" },
    { level: "HSK 2", label: "HSK 2 - Sơ cấp 2", desc: "Hội thoại sinh hoạt hàng ngày cơ bản" },
    { level: "HSK 3", label: "HSK 3 - Trung cấp 1", desc: "Giao tiếp phản xạ & diễn đạt ý kiến" },
  ]

  const handleSelectLevel = (level) => {
    if (onChangeLevel) {
      onChangeLevel(level)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-10 px-4 sm:px-6 flex flex-col items-center text-center">
      {/* Decorative Mascot / Badge */}
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-cath-red-600 via-amber-500 to-orange-400 p-0.5 shadow-2xl shadow-cath-red-500/20">
          <div className="w-full h-full bg-white dark:bg-gray-800 rounded-3xl flex items-center justify-center text-cath-red-600 dark:text-cath-red-400">
            <Compass className="w-12 h-12 stroke-[1.5] animate-pulse" />
          </div>
        </div>
        <span className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-md flex items-center gap-1">
          <Sparkles className="w-3 h-3 fill-current" />
          Sắp ra mắt
        </span>
      </div>

      {/* Title & Body */}
      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
        Lộ trình {hskLevel} sắp ra mắt!
      </h1>

      <p className="max-w-xl text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-3 leading-relaxed">
        Chúng tôi đang hoàn thiện lộ trình nói nâng cao và bộ chủ đề chuyên sâu
        cho trình độ này. Trong lúc chờ đợi, bạn có thể luyện tập phản xạ với{" "}
        <strong className="text-gray-900 dark:text-white font-semibold">
          HSK 1 – HSK 3
        </strong>{" "}
        hoặc tham gia các phòng luyện nói tự do.
      </p>

      {/* Available Level Cards */}
      <div className="w-full max-w-2xl my-8">
        <div className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3 text-left">
          Các lộ trình đang sẵn sàng:
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {availableLevels.map((item) => (
            <div
              key={item.level}
              onClick={() => handleSelectLevel(item.level)}
              className="flex flex-col justify-between p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-cath-red-500 dark:hover:border-cath-red-500 shadow-sm hover:shadow-md transition-all cursor-pointer group text-left active:scale-98"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-cath-red-600 transition-colors">
                    {item.level}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-xs font-semibold text-cath-red-700 dark:text-cath-red-400">
                <span>Chọn lộ trình</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          disabled={isChangingLevel}
          onClick={() => handleSelectLevel("HSK 3")}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-cath-red-700 via-cath-red-600 to-cath-red-700 hover:brightness-110 shadow-lg shadow-cath-red-600/20 active:scale-95 transition-all disabled:opacity-50"
        >
          <GraduationCap className="w-4 h-4" />
          <span>{isChangingLevel ? "Đang chuyển..." : "Luyện tập với HSK 3"}</span>
        </button>

        <button
          type="button"
          onClick={() => navigate(`/${currentLang}/cat-speak`)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 shadow-sm transition-all"
        >
          <MessageCircle className="w-4 h-4 text-gray-400" />
          <span>Phòng luyện nói tự do</span>
        </button>

        {onOpenLevelModal && (
          <button
            type="button"
            onClick={onOpenLevelModal}
            className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Chọn trình độ khác</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default ComingSoonPage
