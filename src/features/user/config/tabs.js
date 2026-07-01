import { User, GraduationCap, CreditCard } from "lucide-react"

/**
 * Get tab configurations for Profile page.
 * @param {object} t - Translation object from useLanguage
 * @returns {Array}
 */
export const getProfileTabsConfig = (t) => [
  {
    id: "/profile",
    label: t?.profile?.sidebar?.personalInfo || "Thông tin cá nhân",
    icon: User,
  },
  {
    id: "/instructor",
    label: t?.profile?.sidebar?.instructor || "Giảng viên",
    icon: GraduationCap,
  },
  {
    id: "/billing",
    label: t?.profile?.sidebar?.billing || "Thanh toán",
    icon: CreditCard,
  },
]
