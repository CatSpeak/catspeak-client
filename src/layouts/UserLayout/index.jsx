import { useState } from "react"
import { Layout } from "lucide-react" // if needed elsewhere, otherwise just removed
import { Outlet, ScrollRestoration } from "react-router-dom"
import HeaderBar from "../../shared/components/Header/HeaderBar"
import Footer from "../../shared/components/Footer"
import Auth from "@/features/auth/components"
import AuthModalContext from "@/shared/context/AuthModalContext"



const UserLayout = ({ showFooter = true }) => {
  const [authModal, setAuthModal] = useState({
    isOpen: false,
    mode: "login",
    redirectAfterLogin: null,
  })

  const openAuthModal = (mode = "login", redirectPath = null) =>
    setAuthModal({
      isOpen: true,
      mode,
      redirectAfterLogin: redirectPath,
    })

  const closeAuthModal = () =>
    setAuthModal((prev) => ({
      ...prev,
      isOpen: false,
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
        <HeaderBar onGetStarted={() => openAuthModal("login")} />

        <main className="w-full flex-1 flex flex-col">
          <Outlet />
        </main>

        {/* Footer full width */}
        {showFooter && <Footer />}

        <Auth
          isOpen={authModal.isOpen}
          mode={authModal.mode}
          onClose={closeAuthModal}
          onSwitchMode={openAuthModal}
        />

        <ScrollRestoration />
      </div>
    </AuthModalContext.Provider>
  )
}

export default UserLayout
