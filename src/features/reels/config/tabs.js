import { Home, Trophy, ChartNoAxesColumn } from "lucide-react"

/**
 * Get tab configurations for Reels Page.
 * @param {object} t - Translation object from useLanguage
 * @returns {Array}
 */
export const getReelTabsConfig = (t) => [
  {
    id: "foryou",
    label: t?.catSpeak?.reels?.foryou || "Dành cho bạn",
    icon: Home,
  },
  {
    id: "challenges",
    label: t?.catSpeak?.reels?.challenges || "Thử thách",
    icon: Trophy,
  },
  {
    id: "leaderboard",
    label: t?.catSpeak?.reels?.leaderboard?.title || "Bảng xếp hạng",
    icon: ChartNoAxesColumn,
  },
]
