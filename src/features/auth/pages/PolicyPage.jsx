import { useEffect, useMemo, useState } from "react"
import { FiArrowUp, FiRefreshCw } from "react-icons/fi"
import { useLanguage } from "../../../shared/context/LanguageContext.jsx"
import colors from "@/shared/utils/colors.js"
import PrivacyPolicy from "@/features/auth/components/popups/policies/PrivacyPolicy"

const PolicyPage = () => {
  const { t, toggleLanguage, language } = useLanguage()
  const policy = t.policies?.privacyPolicy || {}
  const [showScroll, setShowScroll] = useState(false)

  const cinematicBg = useMemo(
    () =>
      `radial-gradient(circle at 20% 15%, ${colors.lightOverlay} 0%, rgba(0,0,0,0) 35%),
       radial-gradient(circle at 80% 0%, rgba(255,180,120,0.3) 0%, rgba(0,0,0,0) 45%),
       linear-gradient(140deg, ${colors.red[900]} 0%, ${colors.dusk} 60%, #050505 100%)`,
    [],
  )

  useEffect(() => {
    const handleScroll = () => setShowScroll(window.scrollY > 300)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" })

  return (
    <section
      className="flex min-h-screen items-center justify-center bg-white px-4 py-10 text-white"
      style={{ background: cinematicBg }}
    >
      <div className="relative w-full max-w-screen-xl rounded-[40px] border border-white/5 dark:border-[#3F3F3F] bg-white/95 dark:bg-[#1A1A1A]/95 text-[#121212] dark:text-white shadow-[0_45px_120px_rgba(0,0,0,0.55)] backdrop-blur-sm">
        <div className="absolute right-6 top-6 flex flex-col items-end gap-3 z-10">
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-white/20"
          >
            <FiRefreshCw className="text-xs" />
            {language === "vi" ? "English" : "Tiếng Việt"}
          </button>
          {showScroll && (
            <button
              type="button"
              onClick={scrollToTop}
              className="flex items-center gap-2 rounded-full bg-[#c4161c] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(196,22,28,0.45)] transition hover:bg-[#a20f16]"
            >
              <FiArrowUp />
              {language === "vi" ? "Lên đầu trang" : "Back to top"}
            </button>
          )}
        </div>
        <div className="rounded-t-[40px] bg-gradient-to-r from-[#9b111e] via-[#c4161c] to-[#f0872a] px-8 py-10 text-center text-white">
          <div className="text-sm uppercase tracking-[0.3em] text-white/80">
            Cat Speak
          </div>
          <h1 className="mt-3 text-4xl font-bold">{policy.title || "Chính sách bảo mật"}</h1>
          <p className="mt-4 text-base text-white/90">
            {language === "vi"
              ? "Cam kết bảo vệ quyền riêng tư và dữ liệu cá nhân của người dùng."
              : "Committed to protecting user privacy and personal data."}
          </p>
        </div>

        <div className="p-8 md:p-14 text-base leading-relaxed bg-white dark:bg-[#1A1A1A] rounded-b-[40px]">
          <PrivacyPolicy />
        </div>
      </div>
    </section>
  )
}

export default PolicyPage
