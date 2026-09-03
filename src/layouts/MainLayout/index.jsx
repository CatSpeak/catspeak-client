import { useState, useEffect } from "react"
import {
  Outlet,
  useLocation,
  useSearchParams,
  ScrollRestoration,
} from "react-router-dom"
import Footer from "../../shared/components/Footer"
import Auth from "@/features/auth/components"
import AuthModalContext from "@/shared/context/AuthModalContext"
import { AnimatePresence } from "framer-motion"
import MainHeader from "../../shared/components/Header/MainHeader"
import { FluentAnimation } from "@/shared/components/ui/animations"
import MainSidebar from "../../shared/components/Sidebar/MainSidebar"
import BackgroundV2 from "@/shared/assets/backgrounds/background-v2.png"
import { useSidebar } from "@/shared/context/SidebarContext"
import LandingHeader from "@/features/landing/components/LandingHeader/LandingHeader"

const MainLayout = ({ showHeader = true, showFooter = true }) => {
  const { isMobileSidebarOpen, setIsMobileSidebarOpen, isDesktopExpanded } =
    useSidebar()

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

  const location = useLocation()
  const [searchParams] = useSearchParams()
  const isLandingPage = location.pathname === "/"
  const isCommunityPage = location.pathname.includes("/community")

  // Check for reset password intent or login redirect intent
  useEffect(() => {
    // If we are on the reset-password route OR we have parameters indicating a reset
    if (location.pathname === "/reset-password") {
      // Assuming parameters are passed in query string: ?token=...&email=...
      setAuthModal((prev) => ({
        ...prev,
        isOpen: true,
        mode: "reset-password",
        email: "",
        pendingActivation: false,
        openNonce: !prev.isOpen ? (prev.openNonce || 0) + 1 : prev.openNonce,
        redirectAfterLogin: null,
      }))
    }
    // Alternatively, check for "mode" param in query string if backend link is like /?mode=reset
    else if (searchParams.get("mode") === "resetPassword") {
      setAuthModal((prev) => ({
        ...prev,
        isOpen: true,
        mode: "reset-password",
        email: "",
        pendingActivation: false,
        openNonce: !prev.isOpen ? (prev.openNonce || 0) + 1 : prev.openNonce,
        redirectAfterLogin: null,
      }))
    }
    // Check for login required redirect via router state
    else if (location.state?.requireLogin) {
      setAuthModal((prev) => ({
        ...prev,
        isOpen: true,
        mode: "login",
        email: "",
        pendingActivation: false,
        openNonce: !prev.isOpen ? (prev.openNonce || 0) + 1 : prev.openNonce,
        redirectAfterLogin: location.state.redirectTo || null,
      }))
    }
  }, [location.pathname, searchParams, location.state])

  const openAuthModal = (mode = "login", secondArg = null, thirdArg = false) => {
    // Dual-nonce: registerNonce only bumps on fresh open (closed -> open) to
    // preserve register form on back navigation (verify -> register). verifyNonce
    // bumps on every entry to verify-email (fresh or forward) to ensure OTP is fresh.
    setAuthModal((prev) => {
      const isFreshOpen = !prev.isOpen
      let registerNonce = prev.registerNonce || 0
      let verifyNonce = prev.verifyNonce || 0
      let openNonce = prev.openNonce || 0

      if (mode === "register") {
        if (isFreshOpen) registerNonce++
      } else if (mode === "verify-email") {
        if (isFreshOpen || prev.mode !== "verify-email") verifyNonce++
        // keep openNonce for other flows
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
      {/* Background for Community Page - covers FULL viewport behind everything */}
      {isCommunityPage && (
        <div
          className="fixed inset-0 pointer-events-none z-0 mt-24"
          style={{
            backgroundImage: `url(${BackgroundV2})`,
            backgroundSize: "cover",
            backgroundPosition: "center top",
            backgroundRepeat: "no-repeat",
          }}
        />
      )}

      <div
        className={`relative flex min-h-screen text-left overflow-x-clip ${
          isLandingPage ? "bg-white" : "bg-primaryBg"
        }`}
      >
        {!isLandingPage && (
          <MainSidebar
            isMobileOpen={isMobileSidebarOpen}
            setIsMobileOpen={setIsMobileSidebarOpen}
          />
        )}

        <div className="flex flex-col flex-1 min-w-0 relative z-10">
          {showHeader &&
            (isLandingPage ? (
              <LandingHeader onGetStarted={() => openAuthModal("login")} />
            ) : (
              <MainHeader
                onGetStarted={() => openAuthModal("login")}
                onMenuClick={() => setIsMobileSidebarOpen(true)}
              />
            ))}

          <main className="flex-1 flex flex-col min-w-0 overflow-x-clip">
            <Outlet />
          </main>

          {/* Footer full width */}
          {showFooter && isLandingPage && <Footer />}
        </div>
      </div>

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
    </AuthModalContext.Provider>
  )
}

export default MainLayout
