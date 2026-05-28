import { useState } from "react"
import { LoginPopup, RegisterPopup, VerifyEmailOtpPopup } from "@/features/auth"
import HeroSection from "@/features/landing/components/HeroSection"
import LanguageBar from "@/features/landing/components/LanguageBar"
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
    <div className="flex flex-col w-full max-w-screen-xl mx-auto">
      <div className="relative w-full pt-4 mb-24">
        {/* Main Hero Section */}
        <HeroSection openAuthModal={openAuthModal} />

        {/* Languages row that overlaps hero bottom - Absolute positioned outside */}
        <LanguageBar />
      </div>

      {/* Values Section - Hero1 */}
      <ValuesSection />

      {/* AI Technology Section */}
      <AISection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Auth Modal */}
      {renderAuthPopup()}
    </div>
  )
}

export default LandingPage
