import React from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import {
  User,
  GraduationCap,
  Building2,
  Settings,
  CreditCard,
} from "lucide-react"
import SharedSidebar from "@/shared/components/layout/SharedSidebar"

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
      isHidden: true, // Temporarily hidden as it lacks content
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
      isHidden: true, // Temporarily hidden as it lacks content
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
