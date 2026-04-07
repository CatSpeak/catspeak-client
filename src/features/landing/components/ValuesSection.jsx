import { useLanguage } from "@/shared/context/LanguageContext.jsx"
import {
  ValuesBackground,
  ValuesCircle,
  ValuesImage,
} from "@/shared/assets/images/home"
import { Play, Users, Network, MessageCircle } from "lucide-react"
import ValueCard from "./ValueCard"

const ValuesSection = () => {
  const { t } = useLanguage()

  return (
    <div className="w-full py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-8 sm:mb-10 md:mb-12 flex flex-col items-center justify-center space-y-2 sm:space-y-3 md:space-y-4">
          <h3 className="font-bold uppercase text-gray-500 text-xs sm:text-sm md:text-base">
            {t.home.whyChooseUs}
          </h3>
          <h2 className="font-bold text-gray-900 text-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl shadow-sm tracking-tight border-0 border-b border-transparent">
            {t.home.valuesTitle}
          </h2>
        </div>

        {/* Main Content Area - Orange Background */}
        <div className="relative w-full drop-shadow-[0_20px_30px_rgba(0,0,0,0.15)]">
          {/* Layer 1: Background - Bottom (Desktop Only) */}
          <img
            src={ValuesBackground}
            alt="Values Background"
            className="hidden min-[1440px]:block w-full h-auto object-contain relative z-0"
          />

          {/* Layer 2: Circle - Middle - Manually Positioned (Desktop Only) */}
          <div className="hidden min-[1440px]:block absolute inset-0 z-[5] pointer-events-none overflow-visible">
            <img
              src={ValuesCircle}
              alt="Decorative Circle"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[120%] w-auto object-contain opacity-90"
              style={{
                // Adjust these values to manually position the circle
                top: "70%",
                left: "65%",
                // transform: "translate(-50%, -50%)"
              }}
            />
          </div>

          {/* Layer 3: Content - Top (Responsive Wrapper) */}
          <div className="relative z-10 min-[1440px]:absolute min-[1440px]:inset-0 grid grid-cols-1 min-[1440px]:grid-cols-2 content-center items-center bg-gradient-to-b from-cath-red-500 via-cath-red-700 to-[#f08d1d] min-[1440px]:bg-none rounded-[24px] sm:rounded-[32px] min-[1440px]:rounded-none p-6 sm:p-8 min-[1440px]:p-0 overflow-hidden min-[1440px]:overflow-visible">
            {/* Decorative Frames (Mobile/Tablets only) */}
            <div className="absolute -top-10 -left-10 w-48 h-48 border-2 border-white rounded-[40px] rotate-12 min-[1440px]:hidden pointer-events-none" />
            <div className="absolute top-1/2 -right-12 w-64 h-64 border-2 border-white rounded-full -translate-y-1/2 min-[1440px]:hidden pointer-events-none" />
            <div className="absolute -bottom-8 left-1/4 w-32 h-32 border-2 border-white rounded-[30px] -rotate-6 min-[1440px]:hidden pointer-events-none" />

            {/* Left Side - Cards Area - 2 Column Grid */}
            <div className="relative z-10 flex justify-center h-full items-center min-[1440px]:p-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 w-full max-w-2xl">
                {/* Card 1: Practice-first */}
                <ValueCard
                  icon={<Play size={32} />}
                  title={t.home.values.practice.title}
                  description={t.home.values.practice.description}
                  color="purple"
                  className="shadow-purple-500/20"
                />

                {/* Card 2: Community-driven */}
                <ValueCard
                  icon={<Users size={32} />}
                  title={t.home.values.community.title}
                  description={t.home.values.community.description}
                  color="blue"
                  className="shadow-blue-400/20"
                />

                {/* Card 3: Expand Networking */}
                <ValueCard
                  icon={<Network size={32} />}
                  title={t.home.values.networking.title}
                  description={t.home.values.networking.description}
                  color="orange"
                  className="shadow-orange-400/20"
                />

                {/* Card 4: Real-life communication */}
                <ValueCard
                  icon={<MessageCircle size={32} />}
                  title={t.home.values.reallife.title}
                  description={t.home.values.reallife.description}
                  color="green"
                  className="shadow-green-500/20"
                />
              </div>
            </div>

            {/* Right Side - Image */}
            <div className="relative z-10 flex justify-center items-center h-full p-2 sm:p-8 min-[1440px]:p-8 order-last">
              <img
                src={ValuesImage}
                alt="Values Illustration"
                className="w-full max-w-xl min-[1440px]:max-w-2xl h-auto object-contain drop-shadow-xl min-[1440px]:-translate-x-12"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ValuesSection
