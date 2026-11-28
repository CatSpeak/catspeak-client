import { useEffect, useMemo, useState } from "react"
import { FiArrowUp, FiRefreshCw } from "react-icons/fi"
import { useLanguage } from "../../../shared/context/LanguageContext.jsx"
import colors from "@/shared/utils/colors.js"
import PrivacyPolicy from "@/features/auth/components/popups/policies/PrivacyPolicy"

const LANGUAGE_LABELS = {
  vi: "Tiếng Việt",
  en: "English",
  zh: "中文",
  ja: "日本語",
}

const PolicyPage = () => {
  const { t, toggleLanguage, language } = useLanguage()
  const policy = t.policy || {}
  const privacyPolicy = t.policies?.privacyPolicy || {}
  const policyTitle = policy.heading || privacyPolicy.title || "Chính sách bảo mật"
  const policySubtitle =
    policy.subtitle ||
    privacyPolicy.intro ||
    "Cam kết bảo vệ quyền riêng tư và dữ liệu cá nhân của người dùng."
  const backToTopLabel =
    policy.backToTop || t.common?.scrollToTop || "Lên đầu trang"
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
      className="flex min-h-screen items-center justify-center overflow-x-clip bg-white px-3 py-6 text-white sm:px-4 sm:py-10"
      style={{ background: cinematicBg }}
    >
      <div className="relative w-full min-w-0 max-w-screen-xl overflow-hidden rounded-2xl border border-white/5 dark:border-[#3F3F3F] bg-white/95 dark:bg-[#1A1A1A]/95 text-[#121212] dark:text-white shadow-[0_45px_120px_rgba(0,0,0,0.55)] backdrop-blur-sm sm:rounded-[40px]">
        <div className="rounded-t-2xl bg-gradient-to-r from-[#9b111e] via-[#c4161c] to-[#f0872a] px-5 py-7 text-center text-white sm:rounded-t-[40px] sm:px-8 sm:py-10">
          <div className="mb-4 flex justify-end sm:absolute sm:right-6 sm:top-6 sm:z-10 sm:mb-0">
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-white/20 sm:px-5 sm:text-sm"
            >
              <FiRefreshCw className="text-xs" />
              {LANGUAGE_LABELS[language] || LANGUAGE_LABELS.vi}
            </button>
          </div>
          <div className="text-sm uppercase tracking-[0.3em] text-white/80">
            Cat Speak
          </div>
          <h1 className="mt-3 text-2xl font-bold sm:text-4xl">{policyTitle}</h1>
          <p className="mt-4 text-base text-white/90">{policySubtitle}</p>
        </div>

        <div className="p-5 sm:p-8 md:p-14 text-base leading-relaxed bg-white dark:bg-[#1A1A1A] rounded-b-2xl sm:rounded-b-[40px] min-w-0 break-words">
          <PrivacyPolicy />
        </div>
      </div>

      {showScroll && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-20 right-6 z-30 flex items-center gap-2 rounded-full bg-[#c4161c] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(196,22,28,0.45)] transition hover:bg-[#a20f16]"
        >
          <FiArrowUp />
          {backToTopLabel}
        </button>
      )}
    </section>
  )
}

export default PolicyPage
