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
    registerNonce: 0,
    verifyNonce: 0,
    openNonce: 0,
    redirectAfterLogin: null,
  })

  const openAuthModal = (mode = "login", secondArg = null, thirdArg = false) => {
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

      if (mode === "verify-email") {
        return {
          isOpen: true,
          mode,
          email: secondArg || "",
          pendingActivation: !!thirdArg,
          registerNonce,
          verifyNonce,
          openNonce,
          redirectAfterLogin: null,
        }
      }
      return {
        isOpen: true,
        mode,
        email: "",
        pendingActivation: false,
        registerNonce,
        verifyNonce,
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
          registerNonce={authModal.registerNonce}
          verifyNonce={authModal.verifyNonce}
          onClose={closeAuthModal}
          onSwitchMode={openAuthModal}
        />

        <ScrollRestoration />
      </div>
    </AuthModalContext.Provider>
  )
}

export default UserLayout
