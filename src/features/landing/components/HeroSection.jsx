import { useLanguage } from "@/shared/context/LanguageContext.jsx"
import { Element1, Element4 } from "../assets"
import { useAuth } from "@/features/auth"
import { useNavigate } from "react-router-dom"
import LanguageCard from "./LanguageCard"
import { Users, BookOpen, GraduationCap, ChevronRight } from "lucide-react"

const stats = [
  {
    value: "50.000 +",
    label: "Người tham gia",
    icon: Users,
    badgeColor: "bg-rose-50 text-[#910B09] border border-rose-100",
  },
  {
    value: "1.200 +",
    label: "Tài nguyên học tập",
    icon: BookOpen,
    badgeColor: "bg-rose-50 text-[#910B09] border border-rose-100",
  },
  {
    value: "300 +",
    label: "Giáo viên đăng ký",
    icon: GraduationCap,
    badgeColor: "bg-rose-50 text-[#910B09] border border-rose-100",
  },
]

const HeroSection = ({ openAuthModal }) => {
  const { t } = useLanguage()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleAction = () => {
    const saved = localStorage.getItem("communityLanguage")
    const community = saved && saved !== "vi" ? saved : "zh"
    if (isAuthenticated) {
      navigate(`/${community}/community`)
    } else {
      openAuthModal("login")
    }
  }

  return (
    <div className="relative w-full bg-white px-6 sm:px-8 md:px-10 pt-16 pb-48 lg:pt-24 lg:pb-56">
      {/* Background Element - Full natural hero ribbon height without cut-off */}
      <img
        src={Element1}
        alt="Background Element"
        className="absolute -top-10 left-0 w-full h-full object-cover object-top opacity-80 pointer-events-none"
      />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12 lg:gap-14 xl:gap-20">
          {/* Left Side - Text Content */}
          <div className="z-20 flex flex-col justify-center gap-6 text-center lg:text-left">
            <div className="space-y-4">
              <h3 className="font-semibold text-cath-red-600 text-base lg:text-sm tracking-wider uppercase">
                {t.home?.subtitle}
              </h3>
              <h2 className="font-bold text-[#910B09] text-3xl sm:text-4xl lg:text-5xl xl:text-6xl leading-tight">
                <span className="text-black">{t.home?.heroTitle1}</span>
                <br />
                <span className="text-[#910B09]">{t.home?.heroTitle2}</span>
              </h2>
              <p className="text-gray-600 text-base sm:text-lg max-w-md sm:max-w-xl lg:max-w-lg xl:max-w-xl mx-auto lg:mx-0">
                {t.home?.heroSubtitle}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-2 justify-center lg:justify-start">
              <button
                onClick={handleAction}
                className="group inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-base font-semibold text-white bg-[#910B09] hover:bg-[#7a0907] transition-colors duration-300 w-full sm:w-auto mx-auto lg:mx-0 shadow-lg hover:shadow-xl"
              >
                <span>{t.home?.ctaButton}</span>
                <ChevronRight className="w-5 h-5 transition-transform duration-300 ease-out group-hover:translate-x-1.5" />
              </button>
            </div>
          </div>

          {/* Right Side - Screen Image */}
          <div className="w-full z-10 flex justify-center lg:justify-end xl:justify-center items-center lg:pl-4 xl:pl-8">
            <LanguageCard />
          </div>
        </div>

        {/* Premium Numbers Section */}
        <div className="mt-16 lg:mt-24 mb-10 relative z-20 max-w-3xl mx-auto bg-white/95 backdrop-blur-xl rounded-xl shadow-sm border border-border p-4 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border">
          {stats.map((item, idx) => {
            const IconComponent = item.icon
            return (
              <div
                key={idx}
                className="flex items-center justify-center"
              >
                <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left cursor-default">
                  {/* Icon Badge */}
                  <div
                    className={`w-11 h-11 rounded-xl ${item.badgeColor} flex items-center justify-center shadow-inner flex-shrink-0`}
                  >
                    <IconComponent size={20} />
                  </div>

                  {/* Text Details */}
                  <div>
                    <div className="text-3xl font-black tracking-tight">
                      {item.value}
                    </div>
                    <div className="text-sm font-semibold text-secondary">
                      {item.label}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottom Illustration Line - Positioned completely BELOW the numbers card */}
      <img
        src={Element4}
        alt=""
        aria-hidden="true"
        className="absolute -bottom-[80px] sm:-bottom-[100px] left-1/2 -translate-x-1/2 w-[100vw] max-w-none pointer-events-none z-10"
      />
    </div>
  )
}

export default HeroSection
