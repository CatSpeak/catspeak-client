const USER_PALETTES = [
  {
    bg: "radial-gradient(circle, #DC2626 0%, #7F1D1D 100%)",
    avatarClass: "!bg-[#FCA5A5] !text-[#7F1D1D]",
  }, // Đỏ (Red)
  {
    bg: "radial-gradient(circle, #EA580C 0%, #7C2D12 100%)",
    avatarClass: "!bg-[#FDBA74] !text-[#7C2D12]",
  }, // Cam (Orange)
  {
    bg: "radial-gradient(circle, #D97706 0%, #78350F 100%)",
    avatarClass: "!bg-[#FDE68A] !text-[#78350F]",
  }, // Vàng (Yellow)
  {
    bg: "radial-gradient(circle, #16A34A 0%, #14532D 100%)",
    avatarClass: "!bg-[#86EFAC] !text-[#14532D]",
  }, // Lục (Green)
  {
    bg: "radial-gradient(circle, #2563EB 0%, #1E3A8A 100%)",
    avatarClass: "!bg-[#93C5FD] !text-[#1E3A8A]",
  }, // Lam (Blue)
  {
    bg: "radial-gradient(circle, #4F46E5 0%, #312E81 100%)",
    avatarClass: "!bg-[#A5B4FC] !text-[#312E81]",
  }, // Chàm (Indigo)
  {
    bg: "radial-gradient(circle, #9333EA 0%, #581C87 100%)",
    avatarClass: "!bg-[#C4B5FD] !text-[#581C87]",
  }, // Tím (Purple)
  {
    bg: "radial-gradient(circle, #DB2777 0%, #831843 100%)",
    avatarClass: "!bg-[#F9A8D4] !text-[#831843]",
  }, // Hồng (Pink)
]

const themeCache = new Map()

export const getParticipantTheme = (identity) => {
  if (!identity) {
    const randomIndex = Math.floor(Math.random() * USER_PALETTES.length)
    return USER_PALETTES[randomIndex]
  }

  if (!themeCache.has(identity)) {
    const randomIndex = Math.floor(Math.random() * USER_PALETTES.length)
    themeCache.set(identity, USER_PALETTES[randomIndex])
  }

  return themeCache.get(identity)
}
