import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowUpFromLine } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"

const ScrollToTopButton = () => {
  const { t } = useLanguage()
  const [isVisible, setIsVisible] = useState(false)

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  useEffect(() => {
    let ticking = false
    const toggleVisibility = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (window.location.pathname.includes('/reels')) {
            setIsVisible(false)
          } else if (window.pageYOffset > 300) {
            setIsVisible(true)
          } else {
            setIsVisible(false)
          }
          ticking = false
        })
        ticking = true
      }
    }

    // Thêm { passive: true } để trình duyệt không phải đợi React chạy xong event mới scroll mượt
    window.addEventListener("scroll", toggleVisibility, { passive: true })
    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 flex items-center justify-center gap-2 rounded-full bg-cath-red-700 w-12 h-12 md:w-auto md:h-auto md:px-5 md:py-2.5 text-white shadow-lg transition-transform hover:scale-105 hover:bg-cath-red-800"
        >
          <ArrowUpFromLine size={22} strokeWidth={2.5} className="md:w-4 md:h-4" />
          <span className="hidden md:inline font-medium tracking-wide">
            {t.scrollToTop || "Scroll to top"}
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  )
}

export default ScrollToTopButton
