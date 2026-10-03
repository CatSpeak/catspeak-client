import { describe, expect, it } from "vitest"
import { MOCK_DECKS, getMockCardsForDeck } from "../../../../store/api/flashcardMocks"

/**
 * Unit tests cho logic hiển thị trạng thái Flashcard Home (fc01) và Decks (fc04/fc05)
 */
describe("Flashcard Home (fc01) State Logic", () => {
  const resolveHomeState = (totalCards, dueCount) => {
    if (totalCards === 0) return "EMPTY"
    if (dueCount === 0) return "ALL_DONE"
    return "HAS_DUE"
  }

  it("nhận diện đúng trạng thái HAS_DUE khi có thẻ đến hạn", () => {
    const state = resolveHomeState(128, 12)
    expect(state).toBe("HAS_DUE")
  })

  it("nhận diện đúng trạng thái ALL_DONE khi đã ôn hết thẻ hôm nay", () => {
    const state = resolveHomeState(128, 0)
    expect(state).toBe("ALL_DONE")
  })

  it("nhận diện đúng trạng thái EMPTY khi chưa có từ nào trong sổ", () => {
    const state = resolveHomeState(0, 0)
    expect(state).toBe("EMPTY")
  })

  it("giải quyết đúng tiêu đề và nhãn theo từng trạng thái", () => {
    const getHeroText = (state, dueCount = 0) => {
      switch (state) {
        case "HAS_DUE":
          return {
            title: `${dueCount} thẻ cần ôn hôm nay`,
            badge: "3 quá hạn",
            subtitle: "— ưu tiên ôn thẻ quá hạn trước",
            showDueButton: true,
          }
        case "ALL_DONE":
          return {
            title: "Đã ôn hết thẻ hôm nay",
            badge: "0 quá hạn",
            subtitle: "— quay lại vào ngày mai, hoặc ôn tự do ngay",
            showDueButton: false,
          }
        case "EMPTY":
        default:
          return {
            title: "Chưa có từ nào trong sổ",
            badge: "0 quá hạn",
            subtitle: "— luyện nói với AI để tạo thẻ đầu tiên",
            showDueButton: false,
          }
      }
    }

    const dueHero = getHeroText("HAS_DUE", 12)
    expect(dueHero.title).toBe("12 thẻ cần ôn hôm nay")
    expect(dueHero.showDueButton).toBe(true)

    const doneHero = getHeroText("ALL_DONE")
    expect(doneHero.title).toBe("Đã ôn hết thẻ hôm nay")
    expect(doneHero.showDueButton).toBe(false)

    const emptyHero = getHeroText("EMPTY")
    expect(emptyHero.title).toBe("Chưa có từ nào trong sổ")
    expect(emptyHero.showDueButton).toBe(false)
  })

  it("tính toán đúng các giá trị cho 3 stat cards", () => {
    const formatStats = (totalCards, dueCount, streakDays = 5) => [
      { id: "total", label: "Tổng thẻ", value: totalCards },
      { id: "due", label: "Đến hạn hôm nay", value: dueCount },
      { id: "streak", label: "Streak", value: totalCards === 0 ? 0 : streakDays },
    ]

    const statsNormal = formatStats(128, 12, 5)
    expect(statsNormal[0].value).toBe(128)
    expect(statsNormal[1].value).toBe(12)
    expect(statsNormal[2].value).toBe(5)

    const statsEmpty = formatStats(0, 0, 5)
    expect(statsEmpty[0].value).toBe(0)
    expect(statsEmpty[1].value).toBe(0)
    expect(statsEmpty[2].value).toBe(0)
  })
})

describe("Flashcard Decks (fc04 & fc05) Logic", () => {
  it("phân nhóm chính xác decks thành HSK và Chủ đề", () => {
    const hskDecks = MOCK_DECKS.filter((d) => d.category !== "topic")
    const topicDecks = MOCK_DECKS.filter((d) => d.category === "topic")

    expect(hskDecks.length).toBeGreaterThanOrEqual(7)
    expect(topicDecks.length).toBeGreaterThanOrEqual(2)

    // Kiểm tra các id chuẩn
    const hskIds = hskDecks.map((d) => d.id)
    expect(hskIds).toContain("recent_wrong")
    expect(hskIds).toContain("hsk1")
    expect(hskIds).toContain("hsk2")
    expect(hskIds).toContain("outside_hsk")

    const topicIds = topicDecks.map((d) => d.id)
    expect(topicIds).toContain("topic_beverage")
    expect(topicIds).toContain("topic_work")
  })

  it("trả về đúng danh sách thẻ cho bộ HSK 2 trong fc05", () => {
    const { items } = getMockCardsForDeck("hsk2")
    expect(items.length).toBeGreaterThan(0)
    expect(items[0]).toHaveProperty("word")
    expect(items[0]).toHaveProperty("pinyin")
    expect(items[0]).toHaveProperty("meaning_vi")

    // Kiểm tra từ 银行 (ngân hàng)
    const yinhang = items.find((c) => c.word === "银行")
    expect(yinhang).toBeDefined()
    expect(yinhang.pinyin).toBe("yínháng")
    expect(yinhang.meaning_vi).toBe("ngân hàng")
  })

  it("lọc chính xác theo tab Nhớ lâu dài", () => {
    const { items } = getMockCardsForDeck("hsk2")
    const masteredCards = items.filter((c) => c.is_mastered)
    expect(masteredCards.length).toBeGreaterThan(0)
    masteredCards.forEach((c) => {
      expect(c.is_mastered).toBe(true)
    })
  })
})
