import React from "react"

/**
 * SharedLayout
 * @param {React.ReactNode} sidebar - The desktop vertical sidebar component
 * @param {React.ReactNode} mobileNav - The mobile horizontal nav component
 * @param {React.ReactNode} background - Optional background component
 * @param {React.ReactNode} children - Main content
 * @param {string} wrapperClassName - Extra classes for the main wrapper
 * @param {string} contentClassName - Extra classes for the content area
 */
const SharedLayout = ({
  sidebar,
  mobileNav,
  background,
  children,
  wrapperClassName = "",
  contentClassName = "max-w-7xl p-6",
}) => {
  return (
    <div
      className={`flex flex-col lg:flex-row w-full flex-1 h-[calc(100vh-70px)] relative z-0 ${wrapperClassName}`}
    >
      {background}

      {/* Desktop Sidebar */}
      {sidebar && (
        <aside className="hidden lg:block w-80 shrink-0 overflow-y-auto border-r border-[#e5e5e5] !bg-white/40 !backdrop-blur-xl sticky top-[70px] self-start h-[calc(100vh-70px)] z-20">
          {sidebar}
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto flex flex-col min-w-0">
        {/* Mobile Tabs */}
        {mobileNav && (
          <div className="lg:hidden sticky top-0 z-20 !bg-white/40 !backdrop-blur-xl overflow-hidden shrink-0 border-b !border-white/30 shadow-[0_4px_24px_rgba(0,0,0,0.05)]">
            {mobileNav}
          </div>
        )}

        {/* Content */}
        <div className={`mx-auto w-full flex-1 ${contentClassName}`}>
          {children}
        </div>
      </main>
    </div>
  )
}

export default SharedLayout
