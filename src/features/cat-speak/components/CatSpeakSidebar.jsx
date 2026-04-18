import React, { useState, useEffect } from "react"
import { useNavigate, useLocation, useParams } from "react-router-dom"
import {
  LayoutDashboard,
  Mail,
  Settings,
  Flag,
  HelpCircle,
  MessageSquare,
  Calendar,
} from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import InDevelopmentModal from "@/shared/components/ui/InDevelopmentModal"

const CatSpeakSidebar = () => {
  const { t } = useLanguage()
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
    { key: "calendar", label: t.catSpeak.sidebar.calendar, icon: Calendar },
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
      return
    }

    if (item.path) {
      navigate(item.path)
    } else if (menuItems.find((i) => i.key === item.key)) {
      navigate(`/${currentLang}/cat-speak/${item.key}`)
    }
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
      {/* Desktop Sidebar Only — mobile nav is handled by the header's MobileDrawer */}
      <div className="hidden lg:block w-[320px] shrink-0 p-5 sticky top-[72px] h-[calc(100vh-80px)] overflow-y-auto [&::-webkit-scrollbar]:hidden">
        <SidebarContent />
      </div>

      {/* Coming Soon Modal */}
      <InDevelopmentModal
        open={devModalOpen}
        onCancel={() => setDevModalOpen(false)}
      />
    </>
  )
}

export default CatSpeakSidebar
