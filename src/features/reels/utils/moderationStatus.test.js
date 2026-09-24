// eslint-disable-next-line import/no-unresolved
import test from "node:test"
// The repository's alias-only import resolver does not recognize Node's built-in protocol.
// eslint-disable-next-line import/no-unresolved
import assert from "node:assert/strict"
import { isReelHidden, reelStatusOf, reelStatusTone } from "./moderationStatus.js"

test("reel đang kiểm duyệt, chờ duyệt, bị từ chối thì chưa xem được", () => {
  assert.equal(isReelHidden("Moderating"), true)
  assert.equal(isReelHidden("PendingReview"), true)
  assert.equal(isReelHidden("Rejected"), true)
  assert.equal(isReelHidden("Public"), false)
  assert.equal(isReelHidden(undefined), false)
})

test("đọc trạng thái từ phản hồi có hoặc không có lớp bọc", () => {
  assert.equal(reelStatusOf({ data: { status: "Moderating" } }), "Moderating")
  assert.equal(reelStatusOf({ status: "Public" }), "Public")
  assert.equal(reelStatusOf(null), null)
})

test("chỉ gắn nhãn cho trạng thái khác công khai", () => {
  assert.equal(reelStatusTone("Public"), null)
  assert.equal(reelStatusTone("Rejected"), "red")
  assert.equal(reelStatusTone("Moderating"), "amber")
})
