import { useState, useEffect } from "react"
import { Layout, theme } from "antd"
import {
  Outlet,
  useLocation,
  useSearchParams,
  ScrollRestoration,
} from "react-router-dom"
import HeaderBar from "./HeaderBar"
import Footer from "./Footer"
import Auth from "@/features/auth/components"
import AuthModalContext from "@/shared/context/AuthModalContext"
import { AnimatePresence } from "framer-motion"
import { FluentAnimation } from "@/shared/components/ui/animations"

const { Content } = Layout

const MainLayout = ({ showHeader = true, showFooter = true }) => {
  const [authModal, setAuthModal] = useState({
    isOpen: false,
    mode: "login",
    redirectAfterLogin: null,
  })

  const location = useLocation()
  const [searchParams] = useSearchParams()

  // Check for reset password intent
  useEffect(() => {
    // If we are on the reset-password route OR we have parameters indicating a reset
    if (location.pathname === "/reset-password") {
      // Assuming parameters are passed in query string: ?token=...&email=...
      setAuthModal({
        isOpen: true,
        mode: "reset-password",
        redirectAfterLogin: null,
      })
    }
    // Alternatively, check for "mode" param in query string if backend link is like /?mode=reset
    else if (searchParams.get("mode") === "resetPassword") {
      setAuthModal({
        isOpen: true,
        mode: "reset-password",
        redirectAfterLogin: null,
      })
    }
  }, [location.pathname, searchParams])

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

  const {
    token: { colorBgContainer },
  } = theme.useToken()

  return (
    <AuthModalContext.Provider
      value={{
        openAuthModal,
        closeAuthModal,
        redirectAfterLogin: authModal.redirectAfterLogin,
      }}
    >
      <Layout className="flex justify-center bg-white">
        {/* Header full width */}
        {showHeader && (
          <HeaderBar onGetStarted={() => openAuthModal("login")} />
        )}

        <Content className="w-full flex justify-center">
          <Outlet />
        </Content>

        {/* Footer full width (bên trong tự giới hạn 1200px) */}
        {showFooter && <Footer />}

        <Auth
          isOpen={authModal.isOpen}
          mode={authModal.mode}
          onClose={closeAuthModal}
          onSwitchMode={openAuthModal}
        />

        <ScrollRestoration />
      </Layout>
    </AuthModalContext.Provider>
  )
}

export default MainLayout
