/**
 * Mock data for Interactive Script Vocabulary Lookup (IS-LN-02 & IS-LN-03)
 */

export const DEFAULT_LANGUAGE_PAIRS = [
  { value: "en-vi", label: "Tiếng Anh → Tiếng Việt" },
  { value: "en-zh", label: "Tiếng Anh → 中文" },
  { value: "en-ja", label: "Tiếng Anh → 日本語" },
  { value: "vi-en", label: "Tiếng Việt → Tiếng Anh" },
]

/**
 * Cụm từ nổi bật có ghi chú giảng viên (IS-LN-03) - Theo mockup Halloween
 */
export const MOCK_CHRISTIAN_HOLIDAY = {
  id: "vocab-001",
  word: "Christian holiday",
  type: "CỤM TỪ",
  ipa: "/'krɪs.tʃən 'fes.tɪ.vəl/",
  audioUrl: null,
  meaning: "Lễ hội Kitô giáo",
  meaningSecondary: "(Christian festival)",
  instructorNote:
    "Đây là ngày lễ tôn giáo của Kitô giáo nhằm tưởng nhớ các vị thánh và linh hồn đã được ban phước. Hiện nay lễ hội này đã mang tính chất văn hóa đại chúng hơn là nghi lễ tôn giáo thuần túy.",
  examples: [
    "Halloween is originally a Christian festival celebrating saints and departed souls.",
    "Christmas is one of the most widely celebrated Christian holidays worldwide.",
    "Easter is an important Christian holiday celebrating the resurrection of Jesus Christ.",
  ],
  relatedWords: ["trick-or-treat", "costume", "ghost"],
}

/**
 * Từ đơn thông thường (IS-LN-02)
 */
export const MOCK_SINGLE_WORD = {
  id: "vocab-002",
  word: "costume",
  type: "DANH TỪ",
  ipa: "/ˈkɒs.tjuːm/",
  audioUrl: null,
  meaning: "Trang phục, y phục hóa trang",
  meaningSecondary: "(Fancy dress, disguise)",
  instructorNote: "",
  examples: [
    "Children wear scary costumes during Halloween.",
    "She wore a traditional Vietnamese costume for the festival.",
  ],
  relatedWords: ["mask", "outfit", "disguise"],
}

/**
 * Default mock data dùng cho WordLookupPopover
 */
export const MOCK_WORD_LOOKUP_DATA = MOCK_CHRISTIAN_HOLIDAY
