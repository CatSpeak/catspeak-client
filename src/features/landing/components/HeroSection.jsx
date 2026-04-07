import { HeroImage } from "@/shared/assets/images/home"
import { useLanguage } from "@/shared/context/LanguageContext.jsx"
import { LiquidGlassButton } from "@/shared/components"
import { useAuth } from "@/features/auth"

const HeroSection = ({ openAuthModal }) => {
  const { t } = useLanguage()
  const { isAuthenticated } = useAuth()

  return (
    <div className="w-full px-6 sm:px-8 md:px-10">
      <div className="relative mx-auto overflow-visible rounded-[24px] sm:rounded-[32px] bg-gradient-to-b from-cath-red-500 via-cath-red-700 to-[#f08d1d] p-6 sm:p-8 md:p-10 lg:p-12 drop-shadow-[0_20px_30px_rgba(0,0,0,0.15)]">
        <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left Side - Banner Image */}
          <div className="relative">
            {/* Decorative white frame at bottom left (similar to design) - Moved behind image */}

            {/* Image Card */}
            <div className="relative aspect-video overflow-hidden rounded-[20px] sm:rounded-[28px]">
              {/* Main Image */}
              <img
                src={HeroImage}
                alt="Hoàn Kiếm Lake"
                className="w-full h-full object-cover"
              />

              {/* Action buttons, hide if user is logged in */}
              {!isAuthenticated && (
                <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 z-20 flex flex-col gap-2 sm:flex-row-reverse sm:gap-3 md:gap-4">
                  <LiquidGlassButton
                    onClick={() => openAuthModal("login")}
                    variant="default"
                    className="w-full flex-1 rounded-[999px] px-4 py-2.5 sm:px-6 sm:py-3 text-sm font-semibold text-white sm:max-w-[220px]"
                  >
                    {t.auth.loginButton}
                  </LiquidGlassButton>
                  <LiquidGlassButton
                    onClick={() => openAuthModal("register")}
                    variant="yellow"
                    className="w-full flex-1 rounded-[999px] px-4 py-2.5 sm:px-6 sm:py-3 text-sm font-semibold text-white sm:max-w-[220px]"
                  >
                    {t.auth.registerButton}
                  </LiquidGlassButton>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Text Content */}
          <div className="flex h-full">
            <div className="flex w-full flex-col justify-center gap-4 sm:gap-6 rounded-[20px] sm:rounded-[24px] border-2 border-white p-6 sm:p-8 lg:p-10 xl:p-12 backdrop-blur-sm">
              <h1 className="font-bold text-[#f4ab1b] text-2xl sm:text-3xl lg:text-4xl xl:text-5xl">
                {t.home.heroTitle}
              </h1>
              <p className="leading-relaxed text-white text-sm sm:text-base lg:text-lg xl:text-xl font-medium">
                {t.home.heroSubtitle}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeroSection
