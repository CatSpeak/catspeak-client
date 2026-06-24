import React, { useState } from "react"
import { useNavigate, useLocation, useParams } from "react-router-dom"
import {
  LayoutDashboard,
  Mail,
  Film,
  Calendar,
} from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import InDevelopmentModal from "@/shared/components/ui/InDevelopmentModal"
import SharedSidebar from "@/shared/components/layout/SharedSidebar"

const getActiveKey = (pathname) => {
  const segments = pathname.split("/").filter(Boolean)
  const catSpeakIndex = segments.indexOf("cat-speak")
  return segments[catSpeakIndex + 1] || "news"
}

const CatSpeakSidebar = () => {
  const { t } = useLanguage()
  const [devModalOpen, setDevModalOpen] = useState(false)
  const location = useLocation()
  const { lang } = useParams()
  const currentLang = lang || "en"
  const activeKey = getActiveKey(location.pathname)

  const menuItems = [
    { key: "news", label: t.catSpeak.sidebar.news, icon: LayoutDashboard },
    { key: "reels", label: t.catSpeak.sidebar.reels || "Reels", icon: Film },
    { key: "mail", label: t.catSpeak.sidebar.mail, icon: Mail },
    { key: "calendar", label: t.catSpeak.sidebar.calendar, icon: Calendar },
  ].map(item => ({
    ...item,
    path: `/${currentLang}/cat-speak/${item.key}`
  }))

  return (
    <>
      <SharedSidebar
        items={menuItems}
        customActive={(item) => activeKey === item.key}
      />
      <InDevelopmentModal
        open={devModalOpen}
        onCancel={() => setDevModalOpen(false)}
      />
    </>
  )
}

export default CatSpeakSidebar
