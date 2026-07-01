export const navLinks = [
  { key: "community", path: "/community", hasDropdown: true },
  {
    key: "catSpeak",
    hasDropdown: true,
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
    path: "/workspace",
    hasDropdown: false,
    hideInSidebar: true,
  },
  // { key: "cart", path: "/cart" },
  // { key: "messages", path: "/messages" },
  // {
  //   key: "courses",
  //   hasDropdown: true,
  //   subItems: [
  //     { key: "allCourses", path: "/courses" },
  //     { key: "myCourses", path: "/my-courses" }
  //   ]
  // },
];

export const footerLinks = [
  { key: "settings", path: "/setting" }, // Trỏ tới trang Cài đặt tài khoản
  // { key: "help", path: "/help" }
];
