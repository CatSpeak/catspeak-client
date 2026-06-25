import React, { useState } from "react"
import { NavLink, Link, useParams } from "react-router-dom"
import {
  Home,
  LayoutDashboard,
  ShoppingCart,
  MessageCircle,
  GraduationCap,
  Settings,
  HelpCircle,
  ChevronDown,
  Menu,
  PanelRightOpen,
} from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { MainLogo, IconLogo } from "@/shared/assets/icons/logo"
import { useLanguage } from "@/shared/context/LanguageContext"

const SidebarV2 = ({ isMobileOpen, setIsMobileOpen, isExpanded, setIsExpanded }) => {
  const { t } = useLanguage()
  const { lang } = useParams()
  const currentLang = lang || localStorage.getItem("communityLanguage") || "zh"

  const [openDropdowns, setOpenDropdowns] = useState({
    catSpeak: false,
    courses: false,
  })

  const [hoveredTooltip, setHoveredTooltip] = useState(null)

  const toggleDropdown = (key) => {
    if (!isExpanded) setIsExpanded(true)
    setOpenDropdowns((prev) => {
      const isCurrentlyOpen = prev[key]
      return {
        catSpeak: false,
        courses: false,
        [key]: !isCurrentlyOpen,
      }
    })
  }

  const handleMouseEnter = (e, label) => {
    if (isExpanded) return
    const rect = e.currentTarget.getBoundingClientRect()
    setHoveredTooltip({ label, top: rect.top + rect.height / 2 })
  }

  const handleMouseLeave = () => {
    setHoveredTooltip(null)
  }

  const getLinkClasses = ({ isActive }) =>
    `relative flex items-center h-11 rounded-lg transition-colors group ${
      isActive
        ? "bg-[#FFF0F2] text-cath-red-700 font-medium"
        : "text-gray-800 hover:bg-[#F2F2F2] hover:text-gray-900"
    } ${isExpanded ? "gap-3 px-4" : "justify-center mx-2"}`

  const getSubLinkClasses = ({ isActive }) =>
    `relative flex items-center w-full h-11 rounded-lg transition-colors z-10 pl-3 pr-4 ${
      isActive
        ? "text-cath-red-700 font-medium bg-[#FFF0F2] lg:bg-transparent lg:hover:bg-[#F2F2F2]" 
        : "text-gray-800 hover:bg-[#F2F2F2]"
    }`

  // Helper for rendering sub-items with curved tree lines
  const renderSubItem = (to, label, isLast) => (
    <div className="relative flex items-center ml-[26px] mr-4 mt-1 h-11">
      {/* Continuing vertical line from top to bottom (only for non-last items) */}
      {!isLast && (
        <div className="absolute left-0 top-[-4px] bottom-[-4px] w-[2px] bg-[#A30014]" />
      )}
      
      {/* Curved branch (connects from top of item to the middle, then curves right) */}
      <div className="absolute left-0 top-[-4px] w-[16px] h-[24px] border-l-[2px] border-b-[2px] border-[#A30014] rounded-bl-[8px]" />
      
      <div className="flex-1 ml-[22px]">
        <NavLink 
          to={to} 
          className={getSubLinkClasses} 
          onClick={() => setIsMobileOpen(false)}
        >
          <span className="text-[15px]">{label}</span>
        </NavLink>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Global Tooltip for collapsed sidebar */}
      <AnimatePresence>
        {hoveredTooltip && !isExpanded && (
          <motion.div 
            initial={{ opacity: 0, x: -5, y: "-50%" }}
            animate={{ opacity: 1, x: 0, y: "-50%" }}
            exit={{ opacity: 0, x: -5, y: "-50%" }}
            transition={{ duration: 0.15 }}
            className="fixed z-[100] left-[90px] px-3 py-1.5 bg-[#A30014] text-white text-sm rounded shadow-md pointer-events-none whitespace-nowrap"
            style={{ top: `${hoveredTooltip.top}px` }}
          >
            {hoveredTooltip.label}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-white border rounded-tr-2xl border-gray-100 flex flex-col transition-all duration-300 z-50 ${
          isExpanded ? "w-[280px]" : "w-[80px]"
        } ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Header/Logo section */}
        <div className="flex items-center justify-between h-[64px] px-4  border-gray-100">
          <div className="flex items-center justify-center w-full h-full">
            {isExpanded ? (
              <div className="flex items-center w-full justify-between">
                <Link to="/" className="flex items-center gap-2 cursor-pointer">
                  <img src={IconLogo} alt="Cat Speak" className="h-7 w-7 ml-2" />
                  <img src={MainLogo} alt="Cat Speak" className="h-6 w-auto " />
                </Link>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1.5rounded-md text-gray-800 hidden lg:block"
                >
                  <PanelRightOpen size={20} />
                </button>
              </div>
            ) : (
              <div 
                className="flex flex-col items-center gap-2 cursor-pointer"
                onClick={() => setIsExpanded(true)}
              >
                <img src={IconLogo} alt="Cat Speak" className="h-7 w-7" />
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-2 px-2 flex flex-col gap-1.5 scrollbar-thin scrollbar-thumb-gray-200">
          {/* Home */}
          <NavLink 
            to={`/${currentLang}/community`} 
            className={getLinkClasses} 
            onClick={() => setIsMobileOpen(false)}
            onMouseEnter={(e) => handleMouseEnter(e, t.nav?.home || "Trang chủ")}
            onMouseLeave={handleMouseLeave}
          >
            <div className={`flex items-center ${isExpanded ? 'gap-3' : ''}`}>
              <Home size={22} className="shrink-0" />
              {isExpanded && <span className="text-[15px]">{t.nav?.home || "Trang chủ"}</span>}
            </div>
          </NavLink>

          {/* Cat Speak Dropdown */}
          <div className="flex flex-col">
            <button
              onClick={() => toggleDropdown("catSpeak")}
              onMouseEnter={(e) => handleMouseEnter(e, t.nav?.catSpeak || "Cat Speak")}
              onMouseLeave={handleMouseLeave}
              className={`relative flex items-center h-11 rounded-lg transition-colors group hover:bg-[#F2F2F2] text-gray-800 ${
                isExpanded ? "justify-between px-4" : "justify-center mx-2"
              }`}
            >
              <div className={`flex items-center ${isExpanded ? 'gap-3' : ''}`}>
                <LayoutDashboard size={22} className="shrink-0" />
                {isExpanded && <span className="text-[15px]">{t.nav?.catSpeak || "Cat Speak"}</span>}
              </div>
              {isExpanded && (
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${
                    openDropdowns.catSpeak ? "rotate-180" : ""
                  }`}
                />
              )}
            </button>
            <AnimatePresence>
              {isExpanded && openDropdowns.catSpeak && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden flex flex-col relative mt-1"
                >
                  {renderSubItem(`/${currentLang}/cat-speak/news`, t.nav?.catSpeakNews || "Bản tin Cat Speak", false)}
                  {renderSubItem(`/${currentLang}/cat-speak/discover`, t.nav?.worldNews || "Bản tin thế giới", false)}
                  {renderSubItem(`/${currentLang}/cat-speak/reels`, t.nav?.reels || "Reels", false)}
                  {renderSubItem(`/${currentLang}/cat-speak/video`, t.nav?.video || "Video", false)}
                  {renderSubItem(`/${currentLang}/cat-speak/calendar`, t.nav?.calendar || "Lịch", true)}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Cart */}
          <NavLink 
            to={`/cart`} 
            className={getLinkClasses} 
            onClick={() => setIsMobileOpen(false)}
            onMouseEnter={(e) => handleMouseEnter(e, t.nav?.cart || "Giỏ hàng")}
            onMouseLeave={handleMouseLeave}
          >
            <div className={`flex items-center ${isExpanded ? 'gap-3' : ''}`}>
              <ShoppingCart size={22} className="shrink-0" />
              {isExpanded && <span className="text-[15px]">{t.nav?.cart || "Giỏ hàng"}</span>}
            </div>
          </NavLink>

          {/* Messages */}
          <NavLink 
            to={`/messages`} 
            className={getLinkClasses} 
            onClick={() => setIsMobileOpen(false)}
            onMouseEnter={(e) => handleMouseEnter(e, t.nav?.messages || "Tin nhắn")}
            onMouseLeave={handleMouseLeave}
          >
            <div className={`flex items-center ${isExpanded ? 'gap-3' : ''}`}>
              <MessageCircle size={22} className="shrink-0" />
              {isExpanded && <span className="text-[15px]">{t.nav?.messages || "Tin nhắn"}</span>}
            </div>
          </NavLink>

          {/* Courses Dropdown */}
          <div className="flex flex-col">
            <button
              onClick={() => toggleDropdown("courses")}
              onMouseEnter={(e) => handleMouseEnter(e, t.nav?.courses || "Khóa học")}
              onMouseLeave={handleMouseLeave}
              className={`relative flex items-center h-11 rounded-lg transition-colors group hover:bg-[#F2F2F2] text-gray-800 ${
                isExpanded ? "justify-between px-4" : "justify-center mx-2"
              }`}
            >
              <div className={`flex items-center ${isExpanded ? 'gap-3' : ''}`}>
                <GraduationCap size={22} className="shrink-0" />
                {isExpanded && <span className="text-[15px]">{t.nav?.courses || "Khóa học"}</span>}
              </div>
              {isExpanded && (
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${
                    openDropdowns.courses ? "rotate-180" : ""
                  }`}
                />
              )}
            </button>
            <AnimatePresence>
              {isExpanded && openDropdowns.courses && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden flex flex-col relative mt-1"
                >
                  {renderSubItem(`/courses`, t.nav?.allCourses || "Các khóa học", false)}
                  {renderSubItem(`/my-courses`, t.nav?.myCourses || "Khóa học của tôi", true)}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Items */}
        <div className="px-2 py-3 flex flex-col gap-1.5 mt-auto border-t border-gray-100">
          <NavLink 
            to={`/settings`} 
            className={getLinkClasses} 
            onClick={() => setIsMobileOpen(false)}
            onMouseEnter={(e) => handleMouseEnter(e, t.nav?.settings || "Thiết lập")}
            onMouseLeave={handleMouseLeave}
          >
            <div className={`flex items-center ${isExpanded ? 'gap-3' : ''}`}>
              <Settings size={22} className="shrink-0" />
              {isExpanded && <span className="text-[15px]">{t.nav?.settings || "Thiết lập"}</span>}
            </div>
          </NavLink>
          <NavLink 
            to={`/help`} 
            className={getLinkClasses} 
            onClick={() => setIsMobileOpen(false)}
            onMouseEnter={(e) => handleMouseEnter(e, t.nav?.help || "Trợ giúp")}
            onMouseLeave={handleMouseLeave}
          >
            <div className={`flex items-center ${isExpanded ? 'gap-3' : ''}`}>
              <HelpCircle size={22} className="shrink-0" />
              {isExpanded && <span className="text-[15px]">{t.nav?.help || "Trợ giúp"}</span>}
            </div>
          </NavLink>
        </div>
      </aside>
    </>
  )
}

export default SidebarV2
