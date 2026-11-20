import { useState, useMemo } from "react"
import { motion as Motion, useReducedMotion } from "framer-motion"
import { getScrollRevealVariants, getScrollTransition } from "@/shared/constants/motion"
import { LoginPopup, RegisterPopup, VerifyEmailOtpPopup } from "@/features/auth"
import HeroSection from "@/features/landing/components/HeroSection"
import PartnerNetworkSection from "@/features/landing/components/PartnerNetworkSection"
// import NewsSection from "@/features/landing/components/NewsSection"
import LearningBarriersSection from "@/features/landing/components/LearningBarriersSection"
import SolutionSection from "@/features/landing/components/SolutionSection"
import CoreFeaturesSection from "@/features/landing/components/CoreFeaturesSection"
// import ExploreEcosystemSection from "@/features/landing/components/ExploreEcosystemSection"
import ResponseSection from "@/features/landing/components/ResponseSection"
import HowItWorksSection from "@/features/landing/components/HowItWorksSection"
// import ValuesSection from "@/features/landing/components/ValuesSection"
import TargetAudienceSection from "@/features/landing/components/TargetAudienceSection"
import MethodComparisonSection from "@/features/landing/components/MethodComparisonSection"
import AISection from "@/features/landing/components/AISection"
import TrustSection from "@/features/landing/components/TrustSection"
import AchievementsSection from "@/features/landing/components/AchievementsSection"
import FAQSection from "@/features/landing/components/FAQSection"
import LandingContactSection from "@/features/landing/components/LandingContactSection"
import LeadingTeamSection from "@/features/landing/components/LeadingTeamSection"

/**
 * Lightweight scroll reveal wrapper for landing page sections.
 * Uses Material Design 3 tokens from motion.js without double-nesting
 * animations on sections that already manage their own internal reveals.
 */
const SectionReveal = ({ children, className = "" }) => {
  const prefersReducedMotion = useReducedMotion()
  const variants = useMemo(
    () => getScrollRevealVariants(prefersReducedMotion),
    [prefersReducedMotion]
  )

  return (
    <Motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15, margin: "0px 0px -60px 0px" }}
      variants={variants}
      className={className}
    >
      {children}
    </Motion.div>
  )
}

const LandingPage = () => {
  const prefersReducedMotion = useReducedMotion()
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
        transition={getScrollTransition("default", 0, prefersReducedMotion)}
        className="relative w-full"
      >
        <HeroSection openAuthModal={openAuthModal} />
      </Motion.div>

      {/* 2. Partner network */}
      <SectionReveal>
        <PartnerNetworkSection />
      </SectionReveal>

      {/* Instructor recruitment banner */}
      <LeadingTeamSection openAuthModal={openAuthModal} />

      {/* 3. Trust / proof section */}
      <SectionReveal>
        <TrustSection />
      </SectionReveal>

      {/* 4. Achievements */}
      <SectionReveal>
        <AchievementsSection />
      </SectionReveal>

      {/* 5. Learning barriers */}
      <SectionReveal>
        <LearningBarriersSection />
      </SectionReveal>

      {/* CAT SPEAK solutions */}
      <SectionReveal>
        <SolutionSection />
      </SectionReveal>

      {/* Existing CatSpeak news section is temporarily hidden. */}
      {/* <NewsSection /> */}

      {/* 6. Core features */}
      <SectionReveal>
        <CoreFeaturesSection />
      </SectionReveal>

      {/* Existing Explore Ecosystem section is temporarily hidden. */}
      {/* <ExploreEcosystemSection /> */}

      {/* 7. Responses */}
      <ResponseSection />

      {/* 7. How CAT SPEAK works */}
      <SectionReveal>
        <HowItWorksSection />
      </SectionReveal>

      {/* Existing Core Values section is temporarily hidden. */}
      {/* <ValuesSection /> */}

      {/* 8. Target audience */}
      <SectionReveal>
        <TargetAudienceSection />
      </SectionReveal>

      {/* 9. Method comparison */}
      <SectionReveal>
        <MethodComparisonSection />
      </SectionReveal>

      {/* 10. AI practice - "Cộng đồng ngôn ngữ tốt nhất" */}
      <AISection />

      {/* 10. FAQ */}
      <FAQSection />

      {/* 12. Contact CTA */}
      <SectionReveal>
        <LandingContactSection />
      </SectionReveal>

      {/* Auth Modal */}
      {renderAuthPopup()}
    </div>
  )
}

export default LandingPage
