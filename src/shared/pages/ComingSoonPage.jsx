import React from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { FiClock } from "react-icons/fi"
import { useLanguage } from "@/shared/context/LanguageContext"
import { AnimatePresence } from "framer-motion"
import { FluentAnimation } from "@/shared/components/ui/animations"

const ComingSoonPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const comingSoon = t?.comingSoon || {}

  // Determine which feature based on pathname
  const getFeatureName = () => {
    if (location.pathname === "/cart") {
      return t?.nav?.cart || "Giỏ hàng"
    }
    if (location.pathname === "/connect") {
      return t?.nav?.connect || "Kết nối"
    }
    return comingSoon.feature || "Tính năng"
  }

  return (
    <AnimatePresence mode="wait">
      <FluentAnimation
        animationKey={location.pathname}
        direction="up"
        className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4 py-16"
      >
        <div className="max-w-md w-full text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-br from-[#f5c34a] to-[#c2131a] rounded-full p-6 shadow-lg">
              <FiClock className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            {getFeatureName()}
          </h1>

          {/* Message */}
          <p className="text-lg text-gray-600 dark:text-neutral-300 mb-6">
            {comingSoon.title || "Sắp ra mắt"}
          </p>

          <p className="text-sm text-gray-600 dark:text-neutral-400 italic">
            {comingSoon.description ||
              "Chúng tôi đang nỗ lực phát triển tính năng này để mang đến trải nghiệm tốt nhất cho bạn. Vui lòng quay lại sau nhé!"}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center rounded-xl border border-gray-200 dark:border-[#3F3F3F] bg-white dark:bg-[#242424] px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-neutral-200 transition-colors hover:bg-gray-50 dark:hover:bg-[#2c2c2c]"
            >
              {t?.common?.back || "Quay lại"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="inline-flex items-center justify-center rounded-xl bg-[#990011] hover:bg-[#85000f] px-5 py-2.5 text-sm font-bold text-white transition-colors"
            >
              {comingSoon.backToHome ||
                t?.common?.comingSoon?.backToHome ||
                "Quay về trang chủ"}
            </button>
            {location.pathname === "/help" && (
              <a
                href="/#faq"
                className="inline-flex items-center justify-center rounded-xl border border-amber-300/60 bg-amber-50 dark:bg-amber-950/30 px-5 py-2.5 text-sm font-semibold text-amber-800 dark:text-amber-200 transition-colors hover:bg-amber-100 dark:hover:bg-amber-900/40"
              >
                {comingSoon.faqCta || "Xem Câu hỏi thường gặp (FAQ)"}
              </a>
            )}
          </div>
        </div>
      </FluentAnimation>
    </AnimatePresence>
  )
}

export default ComingSoonPage
