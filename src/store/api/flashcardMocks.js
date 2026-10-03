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
  total_cards: 87,
  recent_wrong_count: 5,
  active_session: null,
};

export const MOCK_DECKS = [
  {
    id: "hsk1",
    name: "HSK 1",
    description: "Từ vựng cấp độ HSK 1 cơ bản",
    total_cards: 150,
    due_count: 3,
  },
  {
    id: "hsk2",
    name: "HSK 2",
    description: "Từ vựng cấp độ HSK 2",
    total_cards: 120,
    due_count: 9,
  },
  {
    id: "recent_wrong",
    name: "Từ sai gần đây",
    description: "Từ vựng phát âm sai hoặc đánh giá sai trong 7 ngày qua",
    total_cards: 5,
    due_count: 5,
  },
  {
    id: "topic_travel",
    name: "Chủ đề: Du lịch & Khách sạn",
    description: "Từ vựng trích xuất từ các buổi luyện nói chủ đề Du lịch",
    total_cards: 24,
    due_count: 0,
  },
];

export const MOCK_DECK_CARDS = {
  items: [
    {
      card_id: 101,
      word: "苹果",
      pinyin: "píngguǒ",
      meaning_vi: "quả táo",
      card_type: "meaning",
      part_of_speech: "noun",
      hsk_level: 1,
      example_sentence: "我想吃一个苹果。",
      example_source: "academic",
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
      example_sentence: "非常感谢你的帮助。",
      example_source: "learner",
      audio_url: "/v1/speaking/sample-audio?text=%E8%B0%A2%E8%B0%A2&rate=normal",
    },
    {
      card_id: 103,
      word: "高兴",
      pinyin: "gāoxìng",
      meaning_vi: "vui vẻ, vui mừng",
      card_type: "meaning",
      part_of_speech: "adjective",
      hsk_level: 1,
      example_sentence: "今天认识你很高兴。",
      example_source: "ai",
      audio_url: null,
    },
  ],
  next_cursor: null,
  total: 3,
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
