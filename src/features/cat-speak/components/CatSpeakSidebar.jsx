import React, { useState } from "react"
import { useNavigate, useLocation, useParams } from "react-router-dom"
import {
  LayoutDashboard,
  Mail,
  Settings,
  Flag,
  HelpCircle,
  MessageSquare,
  Calendar,
  Film,
} from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import InDevelopmentModal from "@/shared/components/ui/InDevelopmentModal"

const getActiveKey = (pathname) => {
  const segments = pathname.split("/").filter(Boolean)
  const catSpeakIndex = segments.indexOf("cat-speak")
  return segments[catSpeakIndex + 1] || "news"
}

const MenuItem = ({ item, isActive, onClick }) => {
  const Icon = item.icon
  return (
    <button
      onClick={onClick}
      className={`relative flex w-full h-10 items-center gap-3 px-4 text-sm rounded-r-lg transition-colors overflow-hidden ${
        isActive
          ? "font-medium bg-[#F2F2F2] hover:bg-[#E6E6E6] text-cath-red-700 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-full before:w-[3px] before:bg-cath-red-700"
          : "font-normal text-black hover:bg-[#F2F2F2]"
      }`}
    >
      <Icon size={20} className="flex-shrink-0" />
      <span className="truncate">{item.label}</span>
    </button>
  )
}

const CatSpeakSidebar = () => {
  const { t } = useLanguage()
  const [devModalOpen, setDevModalOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { lang } = useParams()
  const currentLang = lang || "en"
  const activeKey = getActiveKey(location.pathname)

  const menuItems = [
    { key: "news", label: t.catSpeak.sidebar.news, icon: LayoutDashboard },
    // { key: "discover", label: t.catSpeak.sidebar.discover, icon: Globe },
    { key: "reels", label: t.catSpeak.sidebar.reels || "Reels", icon: Film },
    { key: "mail", label: t.catSpeak.sidebar.mail, icon: Mail },
    { key: "calendar", label: t.catSpeak.sidebar.calendar, icon: Calendar },
  ]

  const bottomItems = [
    {
      key: "settings",
      label: t?.catSpeak?.sidebar?.settings || "Settings",
      icon: Settings,
    },
    {
      key: "report",
      label: t?.catSpeak?.sidebar?.report || "Report Log",
      icon: Flag,
    },
    {
      key: "help",
      label: t?.catSpeak?.sidebar?.help || "Help",
      icon: HelpCircle,
    },
    {
      key: "feedback",
      label: t?.catSpeak?.sidebar?.feedback || "Send Feedback",
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

  return (
    <>
      {/* Desktop Sidebar Only — mobile nav is handled by the header's MobileDrawer */}
      <div className="hidden lg:block w-[320px] shrink-0 sticky top-[70px] h-[calc(100vh-88px)] overflow-y-auto scrollbar-hidden">
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
        </div>
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
