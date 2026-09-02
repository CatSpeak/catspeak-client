import { useState } from "react"
import { Outlet, ScrollRestoration } from "react-router-dom"
import MainHeader from "../../shared/components/Header/MainHeader"
import Footer from "../../shared/components/Footer"
import Auth from "@/features/auth/components"
import AuthModalContext from "@/shared/context/AuthModalContext"



const UserLayout = ({ showFooter = true }) => {
  const [authModal, setAuthModal] = useState({
    isOpen: false,
    mode: "login",
    email: "",
    pendingActivation: false,
    openNonce: 0,
    redirectAfterLogin: null,
  })

  const openAuthModal = (mode = "login", secondArg = null, thirdArg = false) => {
    // When switching to verify-email, the second arg is the email address and the
    // third arg flags a pending-activation resume (a previously registered account).
    setAuthModal((prev) => {
      const openNonce = (prev.openNonce || 0) + 1
      if (mode === "verify-email") {
        return {
          isOpen: true,
          mode,
          email: secondArg || "",
          pendingActivation: !!thirdArg,
          openNonce,
          redirectAfterLogin: null,
        }
      }
      return {
        isOpen: true,
        mode,
        email: "",
        pendingActivation: false,
        openNonce,
        redirectAfterLogin: secondArg,
      }
    })
  }

  const closeAuthModal = () =>
    setAuthModal((prev) => ({
      ...prev,
      isOpen: false,
      email: "",
      pendingActivation: false,
      redirectAfterLogin: null,
    }))



  return (
    <AuthModalContext.Provider
      value={{
        openAuthModal,
        closeAuthModal,
        redirectAfterLogin: authModal.redirectAfterLogin,
      }}
    >
      <div className="flex flex-col min-h-screen bg-white">
        {/* Header full width */}
        <MainHeader onGetStarted={() => openAuthModal("login")} onMenuClick={() => {}} />

        <main className="w-full flex-1 flex flex-col">
          <Outlet />
        </main>

        {/* Footer full width */}
        {showFooter && <Footer />}

        <Auth
          isOpen={authModal.isOpen}
          mode={authModal.mode}
          email={authModal.email}
          pendingActivation={authModal.pendingActivation}
          openNonce={authModal.openNonce}
          onClose={closeAuthModal}
          onSwitchMode={openAuthModal}
        />

        <ScrollRestoration />
      </div>
    </AuthModalContext.Provider>
  )
}

export default UserLayout
