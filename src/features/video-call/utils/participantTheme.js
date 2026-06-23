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
  {
    bg: "radial-gradient(circle, #0D9488 0%, #134E4A 100%)",
    avatarClass: "!bg-[#5EEAD4] !text-[#134E4A]",
  }, // Mòng két (Teal)
  {
    bg: "radial-gradient(circle, #0284C7 0%, #0C4A6E 100%)",
    avatarClass: "!bg-[#7DD3FC] !text-[#0C4A6E]",
  }, // Xanh da trời (Sky)
  {
    bg: "radial-gradient(circle, #0891B2 0%, #164E63 100%)",
    avatarClass: "!bg-[#67E8F9] !text-[#164E63]",
  }, // Xanh lơ (Cyan)
  {
    bg: "radial-gradient(circle, #65A30D 0%, #3F6212 100%)",
    avatarClass: "!bg-[#D9F99D] !text-[#3F6212]",
  }, // Chanh (Lime)
  {
    bg: "radial-gradient(circle, #059669 0%, #064E3B 100%)",
    avatarClass: "!bg-[#6EE7B7] !text-[#064E3B]",
  }, // Ngọc lục bảo (Emerald)
  {
    bg: "radial-gradient(circle, #C026D3 0%, #701A75 100%)",
    avatarClass: "!bg-[#F0ABFC] !text-[#701A75]",
  }, // Hồng sẫm (Fuchsia)
  {
    bg: "radial-gradient(circle, #E11D48 0%, #881337 100%)",
    avatarClass: "!bg-[#FDA4AF] !text-[#881337]",
  }, // Hoa hồng (Rose)
  {
    bg: "radial-gradient(circle, #7C3AED 0%, #4C1D95 100%)",
    avatarClass: "!bg-[#C4B5FD] !text-[#4C1D95]",
  }, // Tím nhạt (Violet)
]

const themeCache = new Map()

// Deterministic string hash function
const stringToHash = (str) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash)
}

export const getParticipantTheme = (identity, fallbackName = "") => {
  const seedString = identity || fallbackName
  
  if (!seedString) {
    const randomIndex = Math.floor(Math.random() * USER_PALETTES.length)
    return USER_PALETTES[randomIndex]
  }

  if (!themeCache.has(seedString)) {
    const hashIndex = stringToHash(seedString) % USER_PALETTES.length
    themeCache.set(seedString, USER_PALETTES[hashIndex])
  }

  return themeCache.get(seedString)
}
