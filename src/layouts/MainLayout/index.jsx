import { useState, useEffect } from "react";
import {
  Outlet,
  useLocation,
  useSearchParams,
  ScrollRestoration,
} from "react-router-dom";
import Footer from "../../shared/components/Footer";
import Auth from "@/features/auth/components";
import AuthModalContext from "@/shared/context/AuthModalContext";
import { AnimatePresence } from "framer-motion";
import MainHeader from "../../shared/components/Header/MainHeader";
import { FluentAnimation } from "@/shared/components/ui/animations";
import MainSidebar from "../../shared/components/Sidebar/MainSidebar";
import BackgroundV2 from "@/shared/assets/backgrounds/background-v2.png";
import { useSidebar } from "@/shared/context/SidebarContext";
import LandingHeader from "@/features/landing/components/LandingHeader/LandingHeader";

const MainLayout = ({ showHeader = true, showFooter = true }) => {
  const {
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    isSidebarExpanded,
    setIsSidebarExpanded,
  } = useSidebar();

  const [authModal, setAuthModal] = useState({
    isOpen: false,
    mode: "login",
    email: "",
    redirectAfterLogin: null,
  });

  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isLandingPage = location.pathname === "/";
  const isCommunityPage = location.pathname.includes("/community");

  // Check for reset password intent or login redirect intent
  useEffect(() => {
    // If we are on the reset-password route OR we have parameters indicating a reset
    if (location.pathname === "/reset-password") {
      // Assuming parameters are passed in query string: ?token=...&email=...
      setAuthModal({
        isOpen: true,
        mode: "reset-password",
        email: "",
        redirectAfterLogin: null,
      });
    }
    // Alternatively, check for "mode" param in query string if backend link is like /?mode=reset
    else if (searchParams.get("mode") === "resetPassword") {
      setAuthModal({
        isOpen: true,
        mode: "reset-password",
        email: "",
        redirectAfterLogin: null,
      });
    }
    // Check for login required redirect via router state
    else if (location.state?.requireLogin) {
      setAuthModal({
        isOpen: true,
        mode: "login",
        email: "",
        redirectAfterLogin: location.state.redirectTo || null,
      });
    }
  }, [location.pathname, searchParams, location.state]);

  const openAuthModal = (mode = "login", secondArg = null) => {
    // When switching to verify-email, the second arg is the email address
    if (mode === "verify-email") {
      setAuthModal({
        isOpen: true,
        mode,
        email: secondArg || "",
        redirectAfterLogin: null,
      });
    } else {
      setAuthModal({
        isOpen: true,
        mode,
        email: "",
        redirectAfterLogin: secondArg,
      });
    }
  };

  const closeAuthModal = () =>
    setAuthModal((prev) => ({
      ...prev,
      isOpen: false,
      email: "",
      redirectAfterLogin: null,
    }));

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

      <div className="relative flex min-h-screen text-left overflow-x-clip">
        {!isLandingPage && (
          <MainSidebar
            isMobileOpen={isMobileSidebarOpen}
            setIsMobileOpen={setIsMobileSidebarOpen}
            isExpanded={isSidebarExpanded}
            setIsExpanded={setIsSidebarExpanded}
          />
        )}

        <div
          className={`flex flex-col flex-1 min-w-0 transition-all duration-300 relative z-10 ${
            !isLandingPage
              ? isSidebarExpanded
                ? "lg:ml-[280px]"
                : "lg:ml-[80px]"
              : ""
          }`}
        >
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
        onClose={closeAuthModal}
        onSwitchMode={openAuthModal}
      />

      <ScrollRestoration />
    </AuthModalContext.Provider>
  );
};

export default MainLayout;
