import React from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import {
  User,
  GraduationCap,
  Building2,
  Settings,
  CreditCard,
} from "lucide-react"

const ProfileSidebar = ({ onClose, variant = "vertical" }) => {
  const { t } = useLanguage()

  const menuItems = [
    {
      label: t.profile?.sidebar?.personalInfo,
      path: "/profile",
      end: true,
      icon: User,
    },
    {
      label: t.profile?.sidebar?.instructor,
      path: "/instructor",
      end: false,
      icon: GraduationCap,
    },
    {
      label: t.profile?.sidebar?.organization,
      path: "/organization",
      end: false,
      icon: Building2,
      isHidden: true,
    },
    {
      label: t.profile?.sidebar?.setting,
      path: "/setting",
      end: false,
      icon: Settings,
    },
    {
      label: t.profile?.sidebar?.billing,
      path: "/billing",
      end: false,
      icon: CreditCard,
    },
  ].filter((item) => !item.isHidden)

  return <SharedSidebar items={menuItems} variant={variant} onClose={onClose} />
}

export default ProfileSidebar
