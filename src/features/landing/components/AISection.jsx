import { useRef } from "react"
import { useLanguage } from "@/shared/context/LanguageContext.jsx"
import { Check } from "lucide-react"
import { Map } from "../assets"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { useAuthModal } from "@/shared/context/AuthModalContext"
import { useNavigate } from "react-router-dom"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import PencilDoodle from "./PencilDoodle"
import ScrollReveal, { ScrollItem } from "./ScrollReveal"

const AISection = () => {
  const { t } = useLanguage()
  const { isAuthenticated } = useAuth()
  const { openAuthModal } = useAuthModal()
  const navigate = useNavigate()
  const contentRef = useRef(null)

  const aiT = t?.landing?.aiSection || t.home?.aiSection || {}

  const handleAction = () => {
    const community = localStorage.getItem("communityLanguage")
    if (isAuthenticated) {
      navigate(`/${community}/community`)
    } else {
      openAuthModal("login")
    }
  }

  return (
    <section className="w-full py-12 sm:py-16 md:py-20 lg:py-24 bg-white relative overflow-hidden">
      {/* Hand-drawn SVG Doodle — Single Organic Wave path from Left to Right and Top to Bottom */}
      <PencilDoodle
        path="M -30 100 C 160 80, 320 180, 520 170 C 700 160, 860 290, 1060 270 C 1200 250, 1340 460, 1490 540"
        viewBox="0 0 1440 680"
        targetRef={contentRef}
        duration={2.6}
        delay={200}
        direction="ltr"
        listenHandoff={true}
        handoffEvent="catspeak-values-pencil-handoff"
        handoffKey="__catspeak_values_pencil_done"
      />

      <div ref={contentRef} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <ScrollReveal stagger>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-[#990011] px-6 sm:px-10 py-10 sm:py-12 rounded-xl">
            {/* Left Side - Visual Card */}
            <ScrollItem className="relative order-2 lg:order-1">
              <img
                src={Map}
                alt={aiT.imageAlt || "AI Section Card"}
                className="w-full rounded-xl"
              />
            </ScrollItem>

            {/* Right Side - Content */}
            <div className="pt-4 order-1 lg:order-2">
              {/* Sub-header */}
              <ScrollItem>
                <p className="text-sm font-semibold text-[#FFB3AC] mb-2 tracking-wider uppercase">
                  {aiT.header}
                </p>
              </ScrollItem>

              {/* Main Heading */}
              <ScrollItem>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight">
                  {aiT.mainHeading}
                </h2>
              </ScrollItem>

              {/* Features List */}
              <ScrollItem>
                <ul className="flex flex-col gap-4 mb-8 sm:mb-10">
                  {(aiT.features || []).map((feature, index) => (
                    <li key={index} className="flex items-start gap-3.5">
                      <Check className="flex-shrink-0 mt-0.5 text-white" />
                      <span className="text-white leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </ScrollItem>

              {/* CTA Button */}
              <ScrollItem>
                <div className="text-left">
                  <PillButton
                    variant="secondary"
                    onClick={handleAction}
                    className="w-full lg:inline-flex lg:w-auto"
                  >
                    {aiT.learnMore}
                  </PillButton>
                </div>
              </ScrollItem>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

export default AISection
