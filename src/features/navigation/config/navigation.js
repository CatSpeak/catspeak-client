import {
  Home,
  LayoutDashboard,
  GraduationCap,
  Settings,
  Briefcase,
  User,
  CreditCard,
  Newspaper,
  Calendar,
  Mic,
  Film,
  Mail,
  BookOpen,
  DoorOpen,
  Globe,
  BarChart,
  CalendarDays,
  Compass,
  Folder,
  Bookmark,
  ClipboardCheck,
  Bot,
  Target,
  Layers,
  History,
  LayoutGrid,
  Gift,
} from "lucide-react";
import { DEFAULT_COMMUNITY_LANG } from "@/shared/utils/navigation";
import { PLAN_FEATURES } from "@/shared/constants/planFeatures";

export const navSections = [
  {
    key: "main",
    labelKey: null,
    items: [
      { key: "community", path: "/community", icon: Home },
      {
        key: "exploreCourses",
        label: "Explore Courses",
        path: "/explore-courses",
        icon: Compass,
      },
      {
        key: "learningResources",
        label: "Resource Hub",
        path: "/resources",
        icon: Globe,
      },
    ],
  },
  {
    key: "catSpeak",
    labelKey: "catSpeak",
    defaultLabel: "Cat Speak",
    maxInitial: 5,
    items: [
      { key: "globalNews", path: "/cat-speak/global-news", icon: Globe },
      { key: "catSpeakNews", path: "/cat-speak/news", icon: Newspaper },
      { key: "reels", path: "/cat-speak/reels", icon: Film },
      { key: "letters", path: "/cat-speak/letters", icon: Mail },
      { key: "events", path: "/cat-speak/calendar", icon: Calendar },
    ],
  },
  {
    key: "aiTutor",
    labelKey: "aiTutor",
    defaultLabel: "Gia sư AI",
    excludeLangs: ["en", "ja"],
    maxInitial: 5,
    items: [
      {
        key: "levelAssessment",
        path: "/ai-tutor/level-assessment",
        icon: Target,
        excludeLangs: ["en", "ja"],
      },
      {
        key: "learningPath",
        path: "/ai-tutor/learning-path",
        icon: CalendarDays,
        excludeLangs: ["en", "ja"],
      },
      {
        key: "speakingRoom",
        path: "/ai-tutor/speaking-room",
        icon: Mic,
        excludeLangs: ["en", "ja"],
      },
      {
        key: "vocabularyNotebook",
        path: "/ai-tutor/vocabulary-notebook",
        icon: Layers,
        excludeLangs: ["en", "ja"],
      },
      {
        key: "historyProgress",
        path: "/ai-tutor/history-progress",
        icon: History,
        excludeLangs: ["en", "ja"],
      },
    ],
  },
  {
    key: "workspace",
    labelKey: "workspace",
    defaultLabel: "My Workspace",
    maxInitial: 5,
    groups: [
      {
        key: "teaching",
        roles: ["Teacher"],
        items: [
          {
            key: "dashboard",
            path: "/workspace/dashboard",
            icon: LayoutDashboard,
          },
          { key: "myCourses", path: "/workspace/courses", icon: GraduationCap },
          // {
          //   key: "teachingTasks",
          //   path: "/workspace/teaching-tasks",
          //   icon: Briefcase,
          // },
          {
            key: "manageMaterials",
            path: "/workspace/materials",
            icon: Folder,
          },
          { key: "analytics", path: "/workspace/analytics", icon: BarChart },
        ],
      },
      {
        key: "general",
        items: [
          {
            key: "dashboard",
            path: "/workspace/dashboard",
            icon: LayoutDashboard,
            roles: ["Student"],
          },
          { key: "profile", path: "/workspace/profile", icon: User },
          { key: "myLearning", path: "/workspace/learning", icon: BookOpen },
          {
            key: "vocabularyNotebook",
            label: "Sổ từ vựng",
            path: "/workspace/vocabulary",
            icon: Bookmark,
          },
          {
            key: "myCalendar",
            path: "/workspace/my-calendar",
            icon: CalendarDays,
          },
          { key: "myRooms", path: "/workspace/rooms", icon: DoorOpen },
          { key: "recordings", path: "/workspace/recordings", icon: Mic },
          { key: "workspaceReels", path: "/workspace/reels", icon: Film },
          {
            key: "pointsAndOffers",
            path: "/workspace/points-and-offers",
            icon: Gift,
          },
        ],
      },
    ],
    get items() {
      return this.groups.flatMap((g) => g.items);
    },
  },
];

export const dockNavGroups = [
  {
    key: "main",
    items: [
      { key: "community", icon: Home, path: "/community", hasSublinks: false },
      {
        key: "catSpeak",
        icon: Globe,
        path: "/cat-speak/global-news",
        hasSublinks: true,
      },
      {
        key: "aiTutor",
        icon: Bot,
        path: "/ai-tutor/level-assessment",
        hasSublinks: true,
        excludeLangs: ["en", "ja"],
      },
    ],
  },
  {
    key: "secondary",
    items: [
      {
        key: "exploreCourses",
        icon: Compass,
        path: "/explore-courses",
        hasSublinks: false,
      },
      {
        key: "learningResources",
        icon: LayoutDashboard,
        path: "/resources",
        hasSublinks: false,
      },
    ],
  },
  {
    key: "workspace",
    items: [
      {
        key: "workspace",
        icon: Briefcase,
        path: "/workspace",
        hasSublinks: true,
      },
    ],
  },
];

export const TEACHER_ONLY_TABS = [
  "dashboard",
  "myCourses",
  "myClass",
  "analytics",
  "schedule",
  "teachingTasks",
  "manageMaterials",
];

export const isNavItemVisible = (
  item,
  {
    currentLang,
    isAuthenticated,
    activeRole,
    isTeacher,
    isStudent,
    isHorizontal = false,
  } = {},
) => {
  if (!item) return false;
  if (item.hideInSidebar) return false;
  if (item.lang && currentLang && item.lang !== currentLang) return false;
  if (
    item.excludeLangs &&
    currentLang &&
    item.excludeLangs.includes(currentLang)
  )
    return false;
  if (
    item.supportedLangs &&
    currentLang &&
    !item.supportedLangs.includes(currentLang)
  )
    return false;
  if (isHorizontal && item.showOnHorizontalBar === false) return false;
  if (item.isPrivate && !isAuthenticated) return false;
  if (item.roles && activeRole && !item.roles.includes(activeRole))
    return false;
  if (TEACHER_ONLY_TABS.includes(item.key)) {
    if (isStudent) return false;
    if (isTeacher === false) return false;
  }
  return true;
};

export const getActiveDockSection = (pathname) => {
  if (!pathname) return "community";
  const cleanPath = pathname.replace(/^\/(?:zh|en|vi)(?=\/|$)/, "");
  if (cleanPath.startsWith("/pricing")) {
    return "pricing";
  }
  if (
    cleanPath.startsWith("/setting") ||
    cleanPath.startsWith("/billing") ||
    cleanPath.startsWith("/refunds")
  ) {
    return "settings";
  }
  if (
    pathname.includes("/learning-path") ||
    pathname.includes("/ai-tutor") ||
    pathname.includes("/cat-speak/placement-test")
  ) {
    return "aiTutor";
  }
  if (pathname.includes("/cat-speak")) return "catSpeak";
  if (pathname.includes("/profile")) return "profile";
  if (pathname.includes("/explore-courses")) return "exploreCourses";
  if (pathname.includes("/resources")) return "learningResources";
  if (pathname.includes("/workspace")) return "workspace";
  if (pathname.includes("/community")) return "community";
  if (cleanPath.startsWith("/workspace") || cleanPath.includes("/workspace")) {
    return "workspace";
  }
  if (
    cleanPath.includes("/ai-tutor") ||
    cleanPath.includes("/learning-path") ||
    cleanPath.includes("/cat-speak/placement-test")
  ) {
    return "aiTutor";
  }
  if (cleanPath.includes("/cat-speak")) return "catSpeak";
  if (cleanPath.includes("/profile")) return "profile";
  if (cleanPath.includes("/explore-courses")) return "exploreCourses";
  if (cleanPath.includes("/resources")) return "learningResources";
  if (cleanPath.includes("/community")) return "community";
  return "community";
};

export const navLinks = [
  {
    key: "community",
    path: "/community",
    icon: Home,
  },
  {
    key: "catSpeak",
    hasDropdown: true,
    icon: Globe,
    subItems: [
      { key: "globalNews", path: "/cat-speak/global-news", icon: Globe },
      { key: "catSpeakNews", path: "/cat-speak/news", icon: Newspaper },
      { key: "reels", path: "/cat-speak/reels", icon: Film },
      { key: "letters", path: "/cat-speak/letters", icon: Mail },
      { key: "events", path: "/cat-speak/calendar", icon: Calendar },
    ],
  },
  {
    key: "horizontalBar-secondary",
    label: "Horizontal bar",
    isHorizontalBar: true,
    showOnHorizontalBar: false,
  },
  {
    key: "exploreCourses",
    label: "Explore Courses",
    path: "/explore-courses",
    icon: Compass,
  },
  {
    key: "learningResources",
    label: "Resource Hub",
    path: "/resources",
    icon: LayoutDashboard,
    isPrivate: true,
  },
  {
    key: "horizontalBar-workspace",
    label: "Horizontal bar",
    isHorizontalBar: true,
    showOnHorizontalBar: false,
  },
  {
    key: "aiTutor",
    hasDropdown: true,
    icon: Bot,
    excludeLangs: ["en", "ja"],
    subItems: [
      {
        key: "levelAssessment",
        path: "/ai-tutor/level-assessment",
        icon: Target,
      },
      {
        key: "learningPath",
        path: "/ai-tutor/learning-path",
        icon: CalendarDays,
      },
      { key: "speakingRoom", path: "/ai-tutor/speaking-room", icon: Mic },
      {
        key: "vocabularyNotebook",
        path: "/ai-tutor/vocabulary-notebook",
        icon: Layers,
      },
      {
        key: "historyProgress",
        path: "/ai-tutor/history-progress",
        icon: History,
      },
    ],
  },
  {
    key: "workspace",
    hasDropdown: true,
    icon: Briefcase,
    requiresAuth: true,
    groups: [
      {
        key: "teaching",
        roles: ["Teacher"],
        items: [
          {
            key: "dashboard",
            path: "/workspace/dashboard",
            icon: LayoutDashboard,
          },
          { key: "myCourses", path: "/workspace/courses", icon: GraduationCap },
          // { key: "teachingTasks", path: "/workspace/teaching-tasks", icon: Briefcase },
          {
            key: "manageMaterials",
            path: "/workspace/materials",
            icon: Folder,
          },
          { key: "analytics", path: "/workspace/analytics", icon: BarChart },
        ],
      },
      {
        key: "general",
        items: [
          {
            key: "dashboard",
            path: "/workspace/dashboard",
            icon: LayoutDashboard,
            roles: ["Student"],
          },
          { key: "profile", path: "/workspace/profile", icon: User },
          { key: "myLearning", path: "/workspace/learning", icon: BookOpen },
          {
            key: "vocabularyNotebook",
            label: "Sổ từ vựng",
            path: "/workspace/vocabulary",
            icon: Bookmark,
          },
          {
            key: "myCalendar",
            path: "/workspace/my-calendar",
            icon: CalendarDays,
          },
          { key: "myRooms", path: "/workspace/rooms", icon: DoorOpen },
          { key: "recordings", path: "/workspace/recordings", icon: Mic },
          { key: "reels", path: "/workspace/reels", icon: Film },
          {
            key: "pointsAndOffers",
            path: "/workspace/points-and-offers",
            icon: Gift,
          },
        ],
      },
    ],
    get subItems() {
      return this.groups.flatMap((g) => g.items);
    },
  },
  {
    key: "aiTutor",
    label: "Gia sư AI",
    hasDropdown: true,
    icon: Bot,
    subItems: [
      {
        key: "placementTest",
        label: "Đánh giá trình độ",
        path: "/cat-speak/placement-test",
        icon: CircleDot,
      },
      {
        key: "learningPath",
        label: "Lộ trình 5 ngày",
        path: "/learning-path",
        icon: CalendarDays,
      },
      {
        key: "speakingRooms",
        label: "Phòng luyện nói",
        path: "/community",
        icon: Mic,
      },
      {
        key: "vocabularyNotebook",
        label: "Sổ tay từ vựng",
        path: "/workspace/vocabulary",
        icon: Layers,
      },
      {
        key: "learningHistory",
        label: "Lịch sử & Tiến độ",
        path: "/workspace/learning",
        icon: History,
      },
    ],
  },
  {
    key: "horizontalBar-secondary",
    label: "Horizontal bar",
    isHorizontalBar: true,
    showOnHorizontalBar: false,
  },
  {
    key: "exploreCourses",
    label: "Explore Courses",
    path: "/explore-courses",
    icon: Compass,
  },
  {
    key: "learningResources",
    label: "Resource Hub",
    path: "/resources",
    icon: LayoutDashboard,
    isPrivate: true,
  },
];

export const settingNavLinks = [
  {
    key: "accountInfo",
    path: "/setting/account",
    icon: User,
    roles: ["Student", "Admin"],
  },
  { key: "pricing", path: "/pricing", icon: CreditCard },
  { key: "instructor", path: "/setting/instructor", icon: GraduationCap },
  { key: "billing", path: "/billing", icon: CreditCard },
  { key: "systemConfig", path: "/setting/system", icon: Settings },
];

export const footerLinks = [
  { key: "pricing", path: "/pricing", icon: CreditCard },
  { key: "settings", path: "/setting", icon: Settings },
];
