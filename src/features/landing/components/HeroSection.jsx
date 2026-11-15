import { useLanguage } from "@/shared/context/LanguageContext.jsx"
import { useAuth } from "@/features/auth"
import { useNavigate } from "react-router-dom"
import { motion as Motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import LanguageCard from "./LanguageCard"

const HeroSection = ({ openAuthModal }) => {
  const { t } = useLanguage()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const heroT = t?.landing?.hero || {}
  const homeT = t?.home || {}
  const summaryT = heroT.summary || {}

  const handleAction = () => {
    if (!isAuthenticated) {
      openAuthModal?.("login")
      return
    }

    const savedLanguage = localStorage.getItem("communityLanguage")
    const community = savedLanguage && savedLanguage !== "vi" ? savedLanguage : "zh"
    navigate(`/${community}/community`)
  }

  return (
    <section
      id="problem"
      className="w-full scroll-mt-[72px] bg-white px-5 py-8 transition-colors sm:px-8 sm:py-10 dark:bg-[#0F0F0F] lg:px-8 lg:py-0"
    >
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-10 lg:min-h-[560px] lg:grid-cols-[minmax(0,1.35fr)_minmax(420px,0.95fr)] lg:gap-8 xl:gap-10">
        <div className="flex flex-col justify-center lg:py-10">
          <Motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#990011] sm:text-sm"
          >
            <span className="h-2 w-2 shrink-0 rounded-full bg-[#70D6B2]" />
            <span>
              {heroT.subtitle ||
                homeT.subtitle ||
                "Cộng đồng luyện nói 3 ngôn ngữ Anh · Trung · Nhật · hoạt động 24/7"}
            </span>
          </Motion.div>

          <Motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.16 }}
            className="max-w-[720px] text-[clamp(2.35rem,4.2vw,3.35rem)] font-bold leading-[1.08] tracking-[-0.045em] text-[#171717] dark:text-white"
          >
            {heroT.titlePrefix || homeT.heroTitle1 || "Tự tin luyện nói ngoại ngữ cùng"}{" "}
            <span className="text-[#A90016]">
              {heroT.titleHighlight || homeT.heroTitle2 || "cộng đồng"}
            </span>{" "}
            {heroT.titleSuffix || "và AI"}
          </Motion.h1>

          <Motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.24 }}
            className="mt-6 max-w-[680px] text-base leading-[1.75] text-[#555] dark:text-gray-300 sm:text-lg"
          >
            {heroT.description ||
              homeT.heroSubtitle ||
              "Biến kiến thức thành những cuộc trò chuyện thực tế. Kết nối với người học ngôn ngữ, thực hành trong môi trường tương tác và khám phá cách AI hỗ trợ hành trình luyện nói của bạn."}
          </Motion.p>

          <Motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.32 }}
            className="mt-7"
          >
            <button
              type="button"
              onClick={handleAction}
              className="group inline-flex h-[52px] items-center justify-center gap-3 rounded-xl bg-[#A90016] px-7 text-base font-semibold text-white shadow-[0_3px_8px_rgba(169,0,22,0.18)] transition-colors hover:bg-[#890012]"
            >
              <span>{heroT.ctaButton || "Tham gia CAT SPEAK"}</span>
              <ArrowRight
                size={19}
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-1"
              />
            </button>
          </Motion.div>

          <Motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 grid grid-cols-3 border-t border-[#EEEEEE] pt-4 dark:border-[#333]"
          >
            {[
              {
                label: summaryT.roomLabel || "Hình thức phòng",
                value: summaryT.roomValue || "Room 1–1 & Nhóm",
              },
              {
                label: summaryT.languagesLabel || "3 Ngôn ngữ trọng tâm",
                value: summaryT.languagesValue || "Anh · Trung · Nhật",
              },
              {
                label: summaryT.aiLabel || "Trợ lý đồng hành",
                value: summaryT.aiValue || "AI phản xạ 24/7",
              },
            ].map(({ label, value }, index) => (
              <div key={label} className="min-w-0 pr-2 sm:pr-4">
                <p className="text-xs leading-5 text-[#777] dark:text-gray-400 sm:text-sm">{label}</p>
                <p
                  className={`mt-0.5 text-xs font-semibold leading-5 sm:text-sm ${
                    index === 1
                      ? "text-[#A90016] dark:text-[#FF7A8A]"
                      : "text-[#171717] dark:text-gray-100"
                  }`}
                >
                  {value}
                </p>
              </div>
            ))}
          </Motion.div>
        </div>

        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="w-full justify-self-center lg:justify-self-end"
        >
          <LanguageCard />
        </Motion.div>
      </div>
    </section>
  )
}

export default HeroSection
