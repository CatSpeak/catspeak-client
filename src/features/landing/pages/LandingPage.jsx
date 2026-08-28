import { useState } from "react"
import { motion } from "framer-motion"
import { LoginPopup, RegisterPopup, VerifyEmailOtpPopup } from "@/features/auth"
import HeroSection from "@/features/landing/components/HeroSection"
import LeadingTeamSection from "@/features/landing/components/LeadingTeamSection"
import NewsSection from "@/features/landing/components/NewsSection"
import ExploreEcosystemSection from "@/features/landing/components/ExploreEcosystemSection"
import PartnerSection from "@/features/landing/components/PartnerSection"
import ResponseSection from "@/features/landing/components/ResponseSection"
import ValuesSection from "@/features/landing/components/ValuesSection"
import AISection from "@/features/landing/components/AISection"
import FAQSection from "@/features/landing/components/FAQSection"

const LandingPage = () => {
  const [authModal, setAuthModal] = useState({
    isOpen: false,
    mode: "login",
    email: "",
  })

  const openAuthModal = (mode = "login", email = "") =>
    setAuthModal({
      isOpen: true,
      mode,
      email,
    })

  const closeAuthModal = () =>
    setAuthModal((prev) => ({
      ...prev,
      isOpen: false,
    }))

  const switchAuthMode = (mode, email = "") => openAuthModal(mode, email)

  const renderAuthPopup = () => {
    if (!authModal.isOpen) return null

    if (authModal.mode === "register") {
      return (
        <RegisterPopup
          key="register"
          open={true}
          onClose={closeAuthModal}
          onSwitchMode={switchAuthMode}
        />
      )
    }

    if (authModal.mode === "verify-email") {
      return (
        <VerifyEmailOtpPopup
          key="verify-email"
          open={true}
          email={authModal.email}
          onClose={closeAuthModal}
          onSwitchMode={switchAuthMode}
        />
      )
    }

    return (
      <LoginPopup
        key="login"
        open={true}
        onClose={closeAuthModal}
        onSwitchMode={switchAuthMode}
      />
    )
  }

  return (
    <div className="flex flex-col w-full mx-auto overflow-hidden">
      {/* 1. Hero + Numbers */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full pt-4 mb-8 lg:mb-12"
      >
        <HeroSection openAuthModal={openAuthModal} />
      </motion.div>

      {/* 2. Leading Team */}
      <LeadingTeamSection openAuthModal={openAuthModal} />

      {/* 3. News */}
      <NewsSection />

      {/* 4. Explore Ecosystem */}
      <ExploreEcosystemSection />

      {/* 5. Partner */}
      <PartnerSection />

      {/* 6. Response (Testimonials) */}
      <ResponseSection />

      {/* 7. Values */}
      <ValuesSection />

      {/* 8. AI Section */}
      <AISection />

      {/* 9. FAQ */}
      <FAQSection />

      {/* Auth Modal */}
      {renderAuthPopup()}
    </div>
  )
}

export default LandingPage
