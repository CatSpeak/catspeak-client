import React from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { Video, Film } from "lucide-react"
import SharedSidebar from "@/shared/components/layout/SharedSidebar"

const WorkspaceSidebar = ({ onClose, variant = "vertical" }) => {
  const { t } = useLanguage()

  const menuItems = [
    {
      label: t?.recordings?.title || "Recordings",
      path: "/workspace/recordings",
      end: false,
      icon: Video,
    },
    {
      label: t?.catSpeak?.sidebar?.reels || "Reels",
      path: "/workspace/reels",
      end: false,
      icon: Film,
    },
  ]

  return (
    <SharedSidebar
      items={menuItems}
      variant={variant}
      onClose={onClose}
    />
  )
}

export default WorkspaceSidebar
