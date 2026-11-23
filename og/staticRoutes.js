import { WEBSITE_GROUPS } from "../src/features/websites/config/websitesCatalog.js"

const COMMUNITY_THUMBNAILS = {
  zh: "/og/thumbnail-zh.jpg",
  en: "/og/thumbnail-en.jpg",
  ja: "/og/thumbnail-ja.jpg",
}

const COMMUNITY_LOCALES = {
  zh: "zh_CN",
  en: "en_US",
  ja: "ja_JP",
}

/** Real dimensions of every bundled OG image (public/og). */
export const OG_IMAGE_META = {
  "/og/landing.jpg": { width: 1200, height: 556, type: "image/jpeg" },
  "/og/rooms.jpg": { width: 1200, height: 556, type: "image/jpeg" },
  "/og/reels.jpg": { width: 1200, height: 556, type: "image/jpeg" },
  "/og/news.jpg": { width: 1200, height: 556, type: "image/jpeg" },
  "/og/calendar.jpg": { width: 1200, height: 556, type: "image/jpeg" },
  "/og/profile.jpg": { width: 1200, height: 556, type: "image/jpeg" },
  "/og/thumbnail-en.jpg": { width: 1050, height: 600, type: "image/jpeg" },
  "/og/thumbnail-zh.jpg": { width: 1050, height: 600, type: "image/jpeg" },
  "/og/thumbnail-ja.jpg": { width: 900, height: 600, type: "image/jpeg" },
}

export const OG_DEFAULTS = {
  home: {
    title: "Cat Speak - Nền tảng giao tiếp cộng đồng đa ngôn ngữ",
    description:
      "Nơi mà bất kì ai cũng có thể thoải mái giao tiếp, chia sẻ kinh nghiệm, giao lưu văn hóa và kết bạn bốn phương!",
    imageUrl: "/og/landing.jpg",
    ogType: "website",
    locale: "vi_VN",
  },
  rooms: {
    title: "Cat Speak Rooms - Phòng giao tiếp đa ngôn ngữ",
    description:
      "Tham gia ngay vào các phòng luyện nói trực tuyến để tự tin giao tiếp với người bản xứ và bạn bè quốc tế.",
    imageUrl: "/og/rooms.jpg",
    ogType: "website",
    locale: "vi_VN",
  },
  reels: {
    title: "Cat Speak Reels - Video ngắn thú vị",
    description:
      "Khám phá hàng ngàn video ngắn hấp dẫn do cộng đồng thiết kế, vừa giải trí vừa nâng trình ngoại ngữ!",
    imageUrl: "/og/reels.jpg",
    ogType: "website",
    locale: "vi_VN",
  },
  news: {
    title: "Cat Speak News - Cập nhật tin tức mới",
    description:
      "Đón đọc các bài viết chất lượng, mẹo học hiệu quả và các tin tức mới nhất từ cộng đồng Cat Speak.",
    imageUrl: "/og/news.jpg",
    ogType: "website",
    locale: "vi_VN",
  },
  calendar: {
    title: "Cat Speak Calendar - Sự kiện nổi bật",
    description:
      "Đừng bỏ lỡ các sự kiện giao lưu văn hóa, Workshop học tập được lên kế hoạch mỗi ngày. Lưu ngay vào lịch!",
    imageUrl: "/og/calendar.jpg",
    ogType: "website",
    locale: "vi_VN",
  },
  courses: {
    title: "Khóa học & Lớp học - Cat Speak",
    description:
      "Khám phá các khóa học và lớp học chất lượng được giảng viên Cat Speak thiết kế riêng cho bạn.",
    imageUrl: "/og/landing.jpg",
    ogType: "website",
    locale: "vi_VN",
  },
  teachers: {
    title: "Giảng viên Cat Speak",
    description:
      "Gặp gỡ đội ngũ giảng viên giàu kinh nghiệm và xem hồ sơ năng lực của họ trên Cat Speak.",
    imageUrl: "/og/profile.jpg",
    ogType: "profile",
    locale: "vi_VN",
  },
  materials: {
    title: "Tài liệu chia sẻ - Cat Speak",
    description: "Xem tài liệu được chia sẻ trên Cat Speak.",
    imageUrl: "/og/landing.jpg",
    ogType: "article",
    locale: "vi_VN",
  },
  chat: {
    title: "Nhóm trò chuyện Cat Speak",
    description: "Tham gia nhóm trò chuyện trên Cat Speak.",
    imageUrl: "/og/rooms.jpg",
    ogType: "website",
    locale: "vi_VN",
  },
  profile: {
    title: "Cat Speak Profile - Hồ sơ cá nhân",
    description: "Xem hồ sơ và kết nối với người dùng trên Cat Speak.",
    imageUrl: "/og/profile.jpg",
    ogType: "profile",
    locale: "vi_VN",
  },
  aiTutor: {
    title: "AI Tutor - Cat Speak",
    description:
      "Luyện tập ngoại ngữ cùng AI Tutor: lộ trình cá nhân hóa, đánh giá trình độ và phòng luyện nói thông minh.",
    imageUrl: "/og/landing.jpg",
    ogType: "website",
    locale: "vi_VN",
  },
  resources: {
    title: "Kho tài nguyên học ngoại ngữ - Cat Speak",
    description:
      "Tổng hợp 82 website, công cụ và tài nguyên miễn phí để học tiếng Anh, tiếng Trung và tiếng Nhật.",
    imageUrl: "/og/landing.jpg",
    ogType: "website",
    locale: "vi_VN",
  },
  pricing: {
    title: "Bảng giá & Gói dịch vụ - Cat Speak",
    description:
      "Chọn gói dịch vụ phù hợp để mở khóa toàn bộ trải nghiệm học và luyện nói trên Cat Speak.",
    imageUrl: "/og/landing.jpg",
    ogType: "website",
    locale: "vi_VN",
  },
  workspace: {
    title: "Cat Speak Workspace",
    description: "Không gian làm việc và học tập cá nhân trên Cat Speak.",
    imageUrl: "/og/landing.jpg",
    ogType: "website",
    locale: "vi_VN",
  },
}

export function normalizeCommunity(lang) {
  if (!lang) return null
  const code = String(lang).toLowerCase()
  if (code === "zh" || code === "en" || code === "ja") return code
  if (code === "vi" || code === "vn") return "zh"
  return null
}

export function localeFor(lang) {
  const code = normalizeCommunity(lang)
  return code ? COMMUNITY_LOCALES[code] : "vi_VN"
}

function communityThumbnail(lang) {
  const code = normalizeCommunity(lang)
  return code ? COMMUNITY_THUMBNAILS[code] : null
}

function withCommunity(base, lang) {
  const imageUrl = communityThumbnail(lang)
  if (!imageUrl) return { ...base }
  return { ...base, imageUrl, locale: localeFor(lang) }
}

function withLang(base, lang) {
  return { ...base, locale: localeFor(lang) }
}

/** O(1) lookup for the 82 /resources/:id pages. */
export const RESOURCES_BY_ID = new Map()
for (const group of WEBSITE_GROUPS) {
  for (const item of group.subItems || []) {
    const id = item.path?.split("/").filter(Boolean).pop()
    if (!id) continue
    const imageUrl = communityThumbnail(group.lang) || OG_DEFAULTS.resources.imageUrl
    RESOURCES_BY_ID.set(id, {
      title: `${item.label} - Kho tài nguyên Cat Speak`,
      description: item.description || OG_DEFAULTS.resources.description,
      imageUrl,
      ogType: "article",
      locale: localeFor(group.lang),
    })
  }
}

const CONTACT_META = {
  title: "Liên hệ Cat Speak",
  description: "Kết nối với đội ngũ Cat Speak để được hỗ trợ và giải đáp thắc mắc.",
  imageUrl: "/og/landing.jpg",
  ogType: "website",
  locale: "vi_VN",
}

const POLICY_META = {
  title: "Chính sách & Điều khoản - Cat Speak",
  description: "Tìm hiểu chính sách, điều khoản sử dụng và cam kết bảo mật của Cat Speak.",
  imageUrl: "/og/landing.jpg",
  ogType: "website",
  locale: "vi_VN",
}

const HELP_META = {
  title: "Trung tâm trợ giúp - Cat Speak",
  description: "Hướng dẫn sử dụng và giải đáp các câu hỏi thường gặp trên Cat Speak.",
  imageUrl: "/og/landing.jpg",
  ogType: "website",
  locale: "vi_VN",
}

const CONNECT_META = {
  title: "Kết nối cộng đồng Cat Speak",
  description: "Gặp gỡ, trò chuyện và kết bạn với cộng đồng người học ngoại ngữ trên Cat Speak.",
  imageUrl: "/og/landing.jpg",
  ogType: "website",
  locale: "vi_VN",
}

const CART_META = {
  title: "Giỏ hàng - Cat Speak",
  description: "Xem và thanh toán các gói dịch vụ đã chọn trên Cat Speak.",
  imageUrl: "/og/landing.jpg",
  ogType: "website",
  locale: "vi_VN",
}

const LANG = "(zh|en|ja|vi|vn)"

function safeDecode(value) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

const STATIC_RULES = [
  {
    pattern: /^\/$/i,
    resolve: () => ({ ...OG_DEFAULTS.home }),
  },
  {
    pattern: /^\/resources\/([^/]+)$/i,
    resolve: (match) => RESOURCES_BY_ID.get(safeDecode(match[1])) || { ...OG_DEFAULTS.resources },
  },
  {
    pattern: /^\/resources$/i,
    resolve: () => ({ ...OG_DEFAULTS.resources }),
  },
  {
    pattern: new RegExp(`^/${LANG}/community$`, "i"),
    resolve: (match) => withCommunity(OG_DEFAULTS.rooms, match[1]),
  },
  {
    pattern: /^\/workspace\/rooms$/i,
    resolve: () => ({ ...OG_DEFAULTS.rooms }),
  },
  {
    pattern: new RegExp(`^/${LANG}/cat-speak/reels$`, "i"),
    resolve: (match) => withCommunity(OG_DEFAULTS.reels, match[1]),
  },
  {
    pattern: /^\/workspace\/reels$/i,
    resolve: () => ({ ...OG_DEFAULTS.reels }),
  },
  {
    pattern: new RegExp(`^/${LANG}/cat-speak/(?:news|global-news|discover|letters)$`, "i"),
    resolve: (match) => withCommunity(OG_DEFAULTS.news, match[1]),
  },
  {
    pattern: new RegExp(`^/${LANG}/cat-speak/(?:learning-path|placement-test)$`, "i"),
    resolve: (match) => withCommunity(OG_DEFAULTS.aiTutor, match[1]),
  },
  {
    pattern: new RegExp(`^/${LANG}/learning-path$`, "i"),
    resolve: (match) => withCommunity(OG_DEFAULTS.aiTutor, match[1]),
  },
  {
    pattern: new RegExp(`^/${LANG}/cat-speak/calendar$`, "i"),
    resolve: (match) => withCommunity(OG_DEFAULTS.calendar, match[1]),
  },
  {
    pattern: /^\/events$/i,
    resolve: () => ({ ...OG_DEFAULTS.calendar }),
  },
  {
    pattern: /^\/(?:workspace\/)?explore-courses$/i,
    resolve: () => ({ ...OG_DEFAULTS.courses }),
  },
  {
    pattern: new RegExp(`^/${LANG}/pricing$`, "i"),
    resolve: (match) => withLang(OG_DEFAULTS.pricing, match[1]),
  },
  {
    pattern: /^\/pricing$/i,
    resolve: () => ({ ...OG_DEFAULTS.pricing }),
  },
  {
    pattern: new RegExp(`^/${LANG}/ai-tutor(?:/.*)?$`, "i"),
    resolve: (match) => withCommunity(OG_DEFAULTS.aiTutor, match[1]),
  },
  {
    pattern: /^\/contact$/i,
    resolve: () => ({ ...CONTACT_META }),
  },
  {
    pattern: /^\/policy$/i,
    resolve: () => ({ ...POLICY_META }),
  },
  {
    pattern: /^\/help$/i,
    resolve: () => ({ ...HELP_META }),
  },
  {
    pattern: /^\/connect$/i,
    resolve: () => ({ ...CONNECT_META }),
  },
  {
    pattern: /^\/cart$/i,
    resolve: () => ({ ...CART_META }),
  },
  {
    pattern: /^\/workspace\/profile$/i,
    resolve: () => ({ ...OG_DEFAULTS.profile, noIndex: true }),
  },
  {
    pattern: /^\/workspace\/(?:events|my-calendar)(?:\/.*)?$/i,
    resolve: () => ({ ...OG_DEFAULTS.calendar, noIndex: true }),
  },
  {
    pattern: /^\/workspace\/(?:explore-courses|courses|classes|teaching-tasks)(?:\/.*)?$/i,
    resolve: () => ({ ...OG_DEFAULTS.courses, noIndex: true }),
  },
  {
    pattern: /^\/workspace\/(?:learning|vocabulary|recordings|points-and-offers|bonus-points|voucher-exchange|learner-dashboard|schedule|materials|analytics|vouchers|dashboard)(?:\/.*)?$/i,
    resolve: () => ({ ...OG_DEFAULTS.workspace, noIndex: true }),
  },
  {
    pattern: /^\/chat(?:\/.*)?$/i,
    resolve: () => ({ ...OG_DEFAULTS.chat, noIndex: true }),
  },
  {
    pattern: /^\/explore-courses\/class\/[^/]+\/checkout$/i,
    resolve: () => ({ ...CART_META, noIndex: true }),
  },
  {
    pattern: /^\/checkout$/i,
    resolve: () => ({ ...CART_META, noIndex: true }),
  },
  {
    pattern: /^\/billing(?:\/.*)?$/i,
    resolve: () => ({ ...CART_META, noIndex: true }),
  },
  {
    pattern: /^\/setting(?:\/.*)?$/i,
    resolve: () => ({ ...OG_DEFAULTS.workspace, noIndex: true }),
  },
  {
    pattern: /^\/organization(?:\/.*)?$/i,
    resolve: () => ({ ...OG_DEFAULTS.workspace, noIndex: true }),
  },
  {
    pattern: /^\/(?:workspace(?:\/.*)?|app|queue|reset-password|verify-email|403)$/i,
    resolve: () => ({ ...OG_DEFAULTS.workspace, noIndex: true }),
  },
]

/**
 * Resolves metadata for a path that does not need a database lookup.
 * Unknown paths fall back to the home card so crawlers never see an empty page.
 */
export function resolveStaticRoute(normalizedPath) {
  for (const rule of STATIC_RULES) {
    const match = rule.pattern.exec(normalizedPath)
    if (match) {
      return rule.resolve(match)
    }
  }
  return { ...OG_DEFAULTS.home }
}

export function getFallbackMeta(fallbackKey, lang) {
  const base = OG_DEFAULTS[fallbackKey] || OG_DEFAULTS.home
  return withCommunity(base, lang)
}
