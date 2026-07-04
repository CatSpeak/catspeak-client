import React from "react"
import { Link } from "react-router-dom"
import { LandingPageLogo } from "@/features/landing/assets"
import DesktopNavItems from "./DesktopNavItems"

import { Menu } from "lucide-react"
import { useSidebar } from "@/shared/context/SidebarContext"

const DesktopSidebar = () => {
  const { isDesktopSidebarDocked, setIsDesktopSidebarDocked } = useSidebar()

  return (
    <aside
      className={`hidden lg:flex fixed top-0 left-0 h-screen flex-col transition-all duration-300 z-50 ${
        isDesktopSidebarDocked
          ? "w-[80px] bg-cath-red-700 text-white border-none"
          : "w-[280px] bg-white border-r border-border"
      }`}
    >
      {/* Header/Logo section */}
      <div
        className={`flex items-center h-[64px] shrink-0 transition-all duration-300 ${isDesktopSidebarDocked ? "justify-center" : "px-4 gap-3"}`}
      >
        <button
          onClick={() => setIsDesktopSidebarDocked(!isDesktopSidebarDocked)}
          className={`p-2 rounded-md shrink-0 transition-colors ${
            isDesktopSidebarDocked
              ? "text-white hover:bg-white/20"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Menu size={24} />
        </button>

        {!isDesktopSidebarDocked && (
          <div className="flex items-center w-full h-full relative overflow-hidden">
            <Link to="/" className="flex items-center h-full w-full">
              <div className="flex items-center shrink-0">
                <img
                  src={LandingPageLogo}
                  alt="Cat Speak"
                  className="h-10 w-auto shrink-0"
                  draggable={false}
                />
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <DesktopNavItems />
    </aside>
  )
}

export default DesktopSidebar
