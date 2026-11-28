import React from "react"
import { useLocation } from "react-router-dom"
import { FiClock } from "react-icons/fi"
import { useLanguage } from "@/shared/context/LanguageContext"
import { AnimatePresence } from "framer-motion"
import { FluentAnimation } from "@/shared/components/ui/animations"

const ComingSoonPage = () => {
  const location = useLocation()
  const { t } = useLanguage()

  // Determine which feature based on pathname
  const getFeatureName = () => {
    if (location.pathname === "/cart") {
      return t.nav.cart
    }
    if (location.pathname === "/connect") {
      return t.nav.connect
    }
    return t.comingSoon.feature
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
            {t.comingSoon.title}
          </p>

          <p className="text-sm text-gray-600 dark:text-neutral-400 italic">
            {t.comingSoon.description}
          </p>
        </div>
      </FluentAnimation>
    </AnimatePresence>
  )
}

export default ComingSoonPage
