/**
 * Mock data and configurations for Speaking Room Page
 */

export const USER_QUOTA = {
  currentPlan: "Gói Free: 2 buổi/ngày",
  used: 1,
  total: 2,
  percent: 50,
  resetTime: "00:00 hàng ngày",
  upgradeUrl: "/pricing",
}

export const USER_LEVEL = {
  current: "HSK 3 (B1)",
  options: [
    { label: "HSK 1 (A1)", value: "HSK 1" },
    { label: "HSK 2 (A2)", value: "HSK 2" },
    { label: "HSK 3 (B1)", value: "HSK 3" },
    { label: "HSK 4 (B2)", value: "HSK 4" },
    { label: "HSK 5 (C1)", value: "HSK 5" },
    { label: "HSK 6 (C2)", value: "HSK 6" },
  ],
}

export const FILTER_TABS = [
  { id: "all", label: "Tất cả", count: 48 },
  { id: "hsk1-2", label: "HSK 1-2", count: 12 },
  { id: "hsk3", label: "HSK 3 (Khuyên dùng ★ 18)", count: 18, isRecommended: true },
  { id: "hsk4-5", label: "HSK 4-5", count: 14 },
  { id: "hsk6", label: "HSK 6", count: 4 },
]
