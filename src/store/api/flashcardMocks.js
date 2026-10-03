/**
 * Mock Data Tập trung cho Flashcard SRS
 * Phục vụ phát triển Frontend độc lập & kiểm thử (Khôi & Thái)
 * 
 * Tham chiếu hợp đồng: docs/flashcard-srs/api-contracts-final.md
 */

// ==========================================
// 1. MOCK DATA CHO PHẦN CỦA THÁI (Catalog & Settings)
// ==========================================

export const MOCK_FLASHCARD_HOME = {
  due_today_count: 12,
  total_cards: 128,
  recent_wrong_count: 8,
  active_session: null,
};

export const MOCK_DECKS = [
  // Nhóm: Theo trình độ HSK
  {
    id: "recent_wrong",
    name: "Từ sai gần đây (7 ngày)",
    description: "Từ vựng phát âm sai hoặc đánh giá sai trong 7 ngày qua",
    total_cards: 8,
    due_count: 3,
    category: "hsk",
  },
  {
    id: "hsk1",
    name: "HSK 1",
    description: "Từ vựng cấp độ HSK 1 cơ bản",
    total_cards: 35,
    due_count: 0,
    category: "hsk",
  },
  {
    id: "hsk2",
    name: "HSK 2",
    description: "Từ vựng cấp độ HSK 2",
    total_cards: 48,
    due_count: 7,
    category: "hsk",
  },
  {
    id: "hsk3",
    name: "HSK 3",
    description: "Từ vựng cấp độ HSK 3",
    total_cards: 22,
    due_count: 2,
    category: "hsk",
  },
  {
    id: "hsk4",
    name: "HSK 4",
    description: "Từ vựng cấp độ HSK 4",
    total_cards: 12,
    due_count: 0,
    category: "hsk",
  },
  {
    id: "hsk5",
    name: "HSK 5",
    description: "Từ vựng cấp độ HSK 5",
    total_cards: 0,
    due_count: 0,
    category: "hsk",
  },
  {
    id: "hsk6",
    name: "HSK 6",
    description: "Từ vựng cấp độ HSK 6",
    total_cards: 0,
    due_count: 0,
    category: "hsk",
  },
  {
    id: "outside_hsk",
    name: "Ngoài HSK",
    description: "Từ vựng mở rộng ngoài danh sách HSK chuẩn",
    total_cards: 6,
    due_count: 0,
    category: "hsk",
  },
  // Nhóm: Chủ đề
  {
    id: "topic_beverage",
    name: "Gọi đồ uống",
    description: "Từ vựng chủ đề gọi trà sữa, cà phê, đồ uống",
    total_cards: 9,
    due_count: 0,
    category: "topic",
  },
  {
    id: "topic_work",
    name: "Đi làm",
    description: "Từ vựng công sở, phỏng vấn và họp hành",
    total_cards: 14,
    due_count: 0,
    category: "topic",
  },
];

export const MOCK_DECK_CARDS_MAP = {
  hsk2: [
    { card_id: 201, word: "银行", pinyin: "yínháng", meaning_vi: "ngân hàng", card_type: "meaning", hsk_level: 2, is_mastered: false },
    { card_id: 202, word: "请假", pinyin: "qǐngjià", meaning_vi: "xin phép", card_type: "meaning", hsk_level: 2, is_mastered: true },
    { card_id: 203, word: "工资", pinyin: "gōngzī", meaning_vi: "lương", card_type: "meaning", hsk_level: 2, is_mastered: false },
    { card_id: 204, word: "出租", pinyin: "chūzū", meaning_vi: "cho thuê", card_type: "meaning", hsk_level: 2, is_mastered: false },
    { card_id: 205, word: "买单", pinyin: "mǎidān", meaning_vi: "thanh toán", card_type: "meaning", hsk_level: 2, is_mastered: true },
    { card_id: 206, word: "提前", pinyin: "tíqián", meaning_vi: "sớm", card_type: "meaning", hsk_level: 2, is_mastered: false },
  ],
  hsk1: [
    { card_id: 101, word: "苹果", pinyin: "píngguǒ", meaning_vi: "quả táo", card_type: "meaning", hsk_level: 1, is_mastered: false },
    { card_id: 102, word: "谢谢", pinyin: "xièxie", meaning_vi: "cảm ơn", card_type: "pronunciation", hsk_level: 1, is_mastered: true },
    { card_id: 103, word: "老师", pinyin: "lǎoshī", meaning_vi: "thầy cô giáo", card_type: "meaning", hsk_level: 1, is_mastered: true },
    { card_id: 104, word: "高兴", pinyin: "gāoxìng", meaning_vi: "vui vẻ", card_type: "meaning", hsk_level: 1, is_mastered: false },
  ],
  recent_wrong: [
    { card_id: 201, word: "银行", pinyin: "yínháng", meaning_vi: "ngân hàng", card_type: "meaning", hsk_level: 2, is_mastered: false },
    { card_id: 301, word: "学习", pinyin: "xuéxí", meaning_vi: "học tập", card_type: "meaning", hsk_level: 1, is_mastered: false },
    { card_id: 302, word: "开会", pinyin: "kāihuì", meaning_vi: "khai mạc / họp", card_type: "meaning", hsk_level: 2, is_mastered: false },
  ],
};

export const MOCK_DECK_CARDS = {
  items: MOCK_DECK_CARDS_MAP.hsk2,
  next_cursor: null,
  total: MOCK_DECK_CARDS_MAP.hsk2.length,
};

export const getMockCardsForDeck = (deckId) => {
  const items = MOCK_DECK_CARDS_MAP[deckId] || MOCK_DECK_CARDS_MAP.hsk2 || [];
  return {
    items,
    next_cursor: null,
    total: items.length,
  };
};

export const MOCK_REMINDER_SETTINGS = {
  reminder_enabled: true,
  reminder_time: "19:00",
  timezone: "Asia/Ho_Chi_Minh",
};


// ==========================================
// 2. MOCK DATA CHO PHẦN CỦA KHÔI (Review Engine & SRS)
// ==========================================

/**
 * Mock phiên ôn tập trả về từ POST /v1/flashcards/sessions
 * Bao gồm đầy đủ 3 dạng bài tập (flip, fill_blank, multiple_choice)
 */
export const MOCK_REVIEW_SESSION = {
  session_id: "rev_session_mock_987",
  mode: "due",
  total_cards: 4,
  cards: [
    {
      card_id: 101,
      word: "苹果",
      pinyin: "píngguǒ",
      meaning_vi: "quả táo",
      card_type: "meaning",
      part_of_speech: "noun",
      hsk_level: 1,
      exercise_type: "multiple_choice",
      example_sentence: "我想吃一个苹果。",
      example_source: "academic",
      distractors: ["香蕉", "西瓜", "葡萄"],
      audio_url: "/v1/speaking/sample-audio?text=%E8%8B%B9%E6%9E%9C&rate=normal",
    },
    {
      card_id: 102,
      word: "谢谢",
      pinyin: "xièxie",
      meaning_vi: "cảm ơn",
      card_type: "pronunciation",
      part_of_speech: "verb",
      hsk_level: 1,
      exercise_type: "flip",
      example_sentence: "非常感谢你的帮助。",
      example_source: "learner",
      distractors: [],
      audio_url: "/v1/speaking/sample-audio?text=%E8%B0%A2%E8%B0%A2&rate=normal",
    },
    {
      card_id: 103,
      word: "老师",
      pinyin: "lǎoshī",
      meaning_vi: "thầy cô giáo",
      card_type: "meaning",
      part_of_speech: "noun",
      hsk_level: 1,
      exercise_type: "fill_blank",
      example_sentence: "他是我的汉语老师。",
      example_source: "academic",
      distractors: [],
      audio_url: "/v1/speaking/sample-audio?text=%E8%80%81%E5%B8%88&rate=normal",
    },
    {
      card_id: 104,
      word: "高兴",
      pinyin: "gāoxìng",
      meaning_vi: "vui vẻ, hân hoan",
      card_type: "meaning",
      part_of_speech: "adjective",
      hsk_level: 1,
      exercise_type: "flip",
      example_sentence: "今天认识你很高兴。",
      example_source: "ai",
      distractors: [],
      audio_url: null,
    },
  ],
};

/**
 * Mock kết quả chấm điểm từng thẻ trả về từ POST /v1/flashcards/sessions/{id}/review
 */
export const createMockReviewResult = (cardId, isCorrect, isOverride = false) => {
  if (isCorrect || isOverride) {
    return {
      card_id: cardId,
      box_before: 2,
      box_after: 3,
      mastered_step: 0,
      next_due_date: "2026-10-10",
      is_mastered: false,
      streak_updated: true,
    };
  }
  return {
    card_id: cardId,
    box_before: 2,
    box_after: 1,
    mastered_step: 0,
    next_due_date: "2026-10-04",
    is_mastered: false,
    streak_updated: false,
  };
};

/**
 * Mock kết thúc phiên trả về từ POST /v1/flashcards/sessions/{id}/finish
 */
export const MOCK_REVIEW_FINISH_RESULT = {
  session_id: "rev_session_mock_987",
  total_reviewed: 4,
  correct_count: 3,
  wrong_count: 1,
  mastered_count: 1,
  streak_days: 5,
};

/**
 * Mock danh sách ứng viên cần gửi thông báo nhắc ôn tập (cho Worker catspeak-api test)
 */
export const MOCK_REMINDER_CANDIDATES = [
  { account_id: 1, due_count: 12 },
  { account_id: 42, due_count: 5 },
];
