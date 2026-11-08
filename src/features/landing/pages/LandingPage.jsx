import { useState } from "react"
import { motion as Motion } from "framer-motion"
import { LoginPopup, RegisterPopup, VerifyEmailOtpPopup } from "@/features/auth"
import HeroSection from "@/features/landing/components/HeroSection"
import PartnerNetworkSection from "@/features/landing/components/PartnerNetworkSection"
import NewsSection from "@/features/landing/components/NewsSection"
import ExploreEcosystemSection from "@/features/landing/components/ExploreEcosystemSection"
import ResponseSection from "@/features/landing/components/ResponseSection"
import ValuesSection from "@/features/landing/components/ValuesSection"
import AISection from "@/features/landing/components/AISection"
import TrustSection from "@/features/landing/components/TrustSection"
import AchievementsSection from "@/features/landing/components/AchievementsSection"
import FAQSection from "@/features/landing/components/FAQSection"

const LandingPage = () => {
  const [authModal, setAuthModal] = useState({
    isOpen: false,
    mode: "login",
    email: "",
    pendingActivation: false,
    registerNonce: 0,
    verifyNonce: 0,
    openNonce: 0,
  })

  const openAuthModal = (mode = "login", email = "", pendingActivation = false) =>
    setAuthModal((prev) => {
      const isFreshOpen = !prev.isOpen
      let registerNonce = prev.registerNonce || 0
      let verifyNonce = prev.verifyNonce || 0
      let openNonce = prev.openNonce || 0

      if (mode === "register") {
        if (isFreshOpen) registerNonce++
      } else if (mode === "verify-email") {
        if (isFreshOpen || prev.mode !== "verify-email") verifyNonce++
        if (isFreshOpen) openNonce++
      } else {
        if (isFreshOpen) openNonce++
      }

      return {
        isOpen: true,
        mode,
        email,
        pendingActivation: !!pendingActivation,
        registerNonce,
        verifyNonce,
        openNonce,
      }
    })

  const closeAuthModal = () =>
    setAuthModal((prev) => ({
      ...prev,
      isOpen: false,
      email: "",
      pendingActivation: false,
    }))

  const switchAuthMode = (mode, email = "", pendingActivation = false) =>
    openAuthModal(mode, email, pendingActivation)

  const renderAuthPopup = () => {
    if (!authModal.isOpen) return null

    if (authModal.mode === "register") {
      return (
        <RegisterPopup
          key={`register-${authModal.registerNonce}`}
          open={true}
          onClose={closeAuthModal}
          onSwitchMode={switchAuthMode}
        />
      )
    }

    if (authModal.mode === "verify-email") {
      return (
        <VerifyEmailOtpPopup
          key={`verify-email-${authModal.verifyNonce}`}
          open={true}
          email={authModal.email}
          pendingActivation={authModal.pendingActivation}
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
      <Motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full"
      >
        <HeroSection openAuthModal={openAuthModal} />
      </Motion.div>

      {/* 2. Partner network */}
      <PartnerNetworkSection />

      {/* 3. Trust / proof section */}
      <TrustSection />

      {/* 4. Achievements */}
      <AchievementsSection />

      {/* 5. News */}
      <NewsSection />

      {/* 6. Explore Ecosystem */}
      <ExploreEcosystemSection />

      {/* 7. Response (Testimonials) */}
      <ResponseSection />

      {/* 8. Values */}
      <ValuesSection />

      {/* 9. AI Section */}
      <AISection />

      {/* 10. FAQ */}
      <FAQSection />

      {/* Auth Modal */}
      {renderAuthPopup()}
    </div>
  )
}

export default LandingPage
