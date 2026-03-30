import React, { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { useNavigate, useLocation, useParams } from "react-router-dom"
import {
  Menu,
  X,
  LayoutDashboard,
  Globe,
  Video,
  Mail,
  Settings,
  Flag,
  HelpCircle,
  MessageSquare,
} from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import InDevelopmentModal from "@/shared/components/ui/InDevelopmentModal"

const CatSpeakSidebar = () => {
  const { t } = useLanguage()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [devModalOpen, setDevModalOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { lang } = useParams()
  const currentLang = lang || "en"

  // Determine active key based on current path
  const getActiveKey = () => {
    const path = location.pathname.split("/").pop()
    if (path === "cat-speak") return "news" // Default
    return path
  }

  const [activeKey, setActiveKey] = useState(getActiveKey())

  useEffect(() => {
    setActiveKey(getActiveKey())
  }, [location.pathname])

  const menuItems = [
    { key: "news", label: t.catSpeak.sidebar.news, icon: LayoutDashboard },
    // { key: "discover", label: t.catSpeak.sidebar.discover, icon: Globe },
    // { key: "video", label: t.catSpeak.sidebar.video, icon: Video },
    { key: "mail", label: t.catSpeak.sidebar.mail, icon: Mail },
  ]

  const bottomItems = [
    { key: "settings", label: t.catSpeak.sidebar.settings, icon: Settings },
    { key: "report", label: t.catSpeak.sidebar.report, icon: Flag },
    { key: "help", label: t.catSpeak.sidebar.help, icon: HelpCircle },
    {
      key: "feedback",
      label: t.catSpeak.sidebar.feedback,
      icon: MessageSquare,
    },
  ]

  const handleItemClick = (item) => {
    // Check if item belongs to bottomItems
    const isBottomItem = bottomItems.find((i) => i.key === item.key)
    if (isBottomItem) {
      setDevModalOpen(true)
      setMobileOpen(false)
      return
    }

    if (item.path) {
      navigate(item.path)
    } else if (menuItems.find((i) => i.key === item.key)) {
      navigate(`/${currentLang}/cat-speak/${item.key}`)
    }
    setMobileOpen(false)
  }

  const MenuItem = ({ item, isActive, onClick }) => {
    const Icon = item.icon
    return (
      <button
        onClick={onClick}
        className={`flex w-full h-10 items-center gap-3 px-4 text-sm ${
          isActive
            ? "bg-[#F2F2F2] text-[#990011] hover:bg-[#E6E6E6]"
            : "hover:bg-[#F2F2F2]"
        } rounded-[5px]`}
      >
        <Icon className={isActive ? "text-[#990011]" : ""} />
        <span>{item.label}</span>
      </button>
    )
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex flex-col space-y-1">
        {menuItems.map((item) => (
          <MenuItem
            key={item.key}
            item={item}
            isActive={activeKey === item.key}
            onClick={() => handleItemClick(item)}
          />
        ))}
      </div>

      {/* 
      <div className="my-6 h-px w-full bg-gray-100" />
      <div className="flex flex-col space-y-1">
        {bottomItems.map((item) => (
          <MenuItem
            key={item.key}
            item={item}
            isActive={activeKey === item.key}
            onClick={() => handleItemClick(item)}
          />
        ))}
      </div>
      */}
    </div>
  )

  return (
    <>
      {/* Mobile Trigger Button (Visible only on smaller screens) */}
      <div className=" lg:hidden px-5 shrink-0 w-full">
        <button
          onClick={() => setMobileOpen(true)}
          className={`flex w-fit items-center justify-center gap-2 rounded-lg h-10 px-4 text-sm font-medium transition-all duration-200 ${
            mobileOpen
              ? "bg-[#990011] text-white border-[#990011]"
              : "bg-[#F2F2F2] text-gray-700 hover:bg-[#E6E6E6]"
          }`}
        >
          <Menu size={20} />
          <span>{t.catSpeak.sidebar.menu}</span>
        </button>
      </div>

      {/* Desktop Sidebar Container */}
      <div className="hidden lg:block w-[320px] shrink-0 p-5 sticky top-[80px] h-[calc(100vh-80px)] overflow-y-auto [&::-webkit-scrollbar]:hidden">
        <SidebarContent />
      </div>

      {/* Mobile Drawer Portal */}
      {createPortal(
        <div className="fixed inset-0 z-[1000] lg:hidden pointer-events-none">
          {/* Mobile Drawer Overlay */}
          {mobileOpen && (
            <div
              className="fixed inset-0 bg-black/40 transition-opacity pointer-events-auto"
              onClick={() => setMobileOpen(false)}
            />
          )}

          {/* Mobile Drawer Panel */}
          <div
            className={`fixed top-0 left-0 h-full w-[280px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out pt-4 pb-6 px-4 flex flex-col pointer-events-auto ${
              mobileOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="flex justify-between items-center mb-6 px-2">
              <span className="text-lg font-bold text-gray-900 tracking-tight">
                {t.catSpeak.sidebar.menu}
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
              <SidebarContent />
            </div>
          </div>
        </div>,
        document.body,
      )}

      {/* Coming Soon Modal */}
      <InDevelopmentModal
        open={devModalOpen}
        onCancel={() => setDevModalOpen(false)}
      />
    </>
  )
}

export default CatSpeakSidebar
