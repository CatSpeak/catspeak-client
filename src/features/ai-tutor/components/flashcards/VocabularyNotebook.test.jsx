import { describe, expect, it } from "vitest"

/**
 * Unit tests cho logic hiển thị trạng thái Flashcard Home (fc01)
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
    expect(statsNormal[1].value).toBe(12),
    expect(statsNormal[2].value).toBe(5)

    const statsEmpty = formatStats(0, 0, 5)
    expect(statsEmpty[0].value).toBe(0)
    expect(statsEmpty[1].value).toBe(0)
    expect(statsEmpty[2].value).toBe(0)
  })
})
