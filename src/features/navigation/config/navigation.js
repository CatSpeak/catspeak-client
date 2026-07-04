import {
  Home,
  LayoutDashboard,
  ShoppingCart,
  MessageCircle,
  GraduationCap,
  Settings,
  HelpCircle,
  Briefcase,
  User,
  CreditCard,
} from "lucide-react";

export const navLinks = [
  { key: "community", path: "/community", hasDropdown: true, icon: Home },
  {
    key: "catSpeak",
    hasDropdown: true,
    icon: LayoutDashboard,
    subItems: [
      { key: "catSpeakNews", path: "/cat-speak/news" },
      // { key: "worldNews", path: "/cat-speak/discover" },
      { key: "reels", path: "/cat-speak/reels" },
      // { key: "video", path: "/cat-speak/video" },
      { key: "calendar", path: "/cat-speak/calendar" },
    ],
  },
  {
    key: "workspace",
    hasDropdown: true,
    icon: Briefcase,
    subItems: [
      { key: "recordings", path: "/workspace/recordings" },
      { key: "reels", path: "/workspace/reels" },
    ],
  },
  {
    key: "profile",
    hasDropdown: true,
    icon: User,
    subItems: [
      { key: "personalInfo", path: "/profile" },
      { key: "instructor", path: "/instructor" },
      // { key: "organization", path: "/organization" },
      // { key: "billing", path: "/billing" },
    ],
  },
  {
    key: "pricing",
    path: "/pricing",
    hasDropdown: false,
    icon: CreditCard,
  },
  // { key: "cart", path: "/cart", icon: ShoppingCart },
  // { key: "messages", path: "/messages", icon: MessageCircle },
  // {
  //   key: "courses",
  //   hasDropdown: true,
  //   icon: GraduationCap,
  //   subItems: [
  //     { key: "allCourses", path: "/courses" },
  //     { key: "myCourses", path: "/my-courses" }
  //   ]
  // },
];

export const footerLinks = [
  { key: "settings", path: "/setting", icon: Settings }, // Trỏ tới trang Cài đặt tài khoản
  // { key: "help", path: "/help", icon: HelpCircle }
];
