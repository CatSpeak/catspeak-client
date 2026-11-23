import { describe, expect, it } from "vitest"
import { flushQueue } from "@/features/ai-tutor/utils/flashcardOfflineSync"
import { createGradeQueue } from "./gradeQueue"

const memoryStorage = () => {
  const data = new Map()
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => data.set(k, String(v)),
    removeItem: (k) => data.delete(k),
  }
}

const grade = (over = {}) => ({ cardId: 7, rating: 3, mode: "word", isCorrect: true, elapsedMs: 4200.6, hintsUsed: 0, ...over })

describe("createGradeQueue (QA-S2: gửi lặp, offline)", () => {
  it("sống qua tải lại trang (cùng storage)", () => {
    const storage = memoryStorage()
    createGradeQueue({ storage }).enqueue(grade())
    const again = createGradeQueue({ storage })
    expect(again.size()).toBe(1)
    expect(again.list()[0]).toMatchObject({ cardId: 7, rating: 3, elapsedMs: 4201 })
    expect(again.list()[0].clientReviewId).toBeTruthy()
    expect(again.list()[0].reviewedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  it("cùng clientReviewId không ghi hai lần", () => {
    const q = createGradeQueue({ storage: memoryStorage() })
    q.enqueue(grade({ clientReviewId: "a" }))
    q.enqueue(grade({ clientReviewId: "a", rating: 1 }))
    expect(q.size()).toBe(1)
    expect(q.list()[0].rating).toBe(1)
  })

  it("mất mạng giữa chừng: giữ thứ tự, gửi bù phần còn lại", async () => {
    const q = createGradeQueue({ storage: memoryStorage() })
    q.enqueue(grade({ clientReviewId: "1" }))
    q.enqueue(grade({ clientReviewId: "2" }))
    q.enqueue(grade({ clientReviewId: "3" }))
    const sent = []
    let offline = false
    const send = async (item) => {
      if (offline) throw { status: "FETCH_ERROR" }
      sent.push(item.clientReviewId)
      if (item.clientReviewId === "1") offline = true
      return { due_at: "2030-01-01T00:00:00Z" }
    }
    const first = await flushQueue(q, send)
    expect(first.sent).toBe(1)
    expect(q.list().map((i) => i.clientReviewId)).toEqual(["2", "3"])
    offline = false
    await flushQueue(q, send)
    expect(sent).toEqual(["1", "2", "3"])
    expect(q.size()).toBe(0)
  })

  it("lỗi 4xx vĩnh viễn (thẻ đã xoá) thì bỏ, không kẹt hàng đợi", async () => {
    const q = createGradeQueue({ storage: memoryStorage() })
    q.enqueue(grade({ clientReviewId: "gone" }))
    const r = await flushQueue(q, async () => {
      throw { status: 404 }
    })
    expect(r.dropped).toBe(1)
    expect(q.size()).toBe(0)
  })

  it("không có localStorage vẫn chạy trong bộ nhớ", () => {
    const broken = { setItem: () => { throw new Error("blocked") }, getItem: () => null, removeItem: () => {} }
    const q = createGradeQueue({ storage: broken })
    q.enqueue(grade())
    expect(q.size()).toBe(1)
  })
})
