/* eslint import/no-unresolved: ["error", { ignore: ["^node:"] }] */
import test from "node:test"
import assert from "node:assert/strict"
import { generateClassRecurrence, classTimeToIso, normalizeClassInvitees, assertExistingScheduleSupport } from "./classRecurrence.js"

const make = (overrides = {}) => ({ startDate: "2026-10-12", sessions: 4, checkedDays: { monday: true, wednesday: true }, timeSlots: { monday: { start: "18:00", end: "19:30" }, wednesday: { start: "18:00", end: "19:30" } }, timeZone: "Asia/Ho_Chi_Minh", ...overrides })
test("weekly weekdays preserve the existing schedule", () => {
  assert.deepEqual(generateClassRecurrence(make()).map(d => d.dateStr), ["2026-10-12", "2026-10-14", "2026-10-19", "2026-10-21"])
})
test("every two weeks is anchored to Monday, including a midweek start", () => {
  assert.deepEqual(generateClassRecurrence(make({ startDate: "2026-10-14", recurrence: { interval: 2 } })).map(d => d.dateStr), ["2026-10-14", "2026-10-26", "2026-10-28", "2026-11-09"])
})
test("daily recurrence supports an interval and a leap day", () => {
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
  const result = generateClassRecurrence(make({ startDate: "2028-02-27", checkedDays: Object.fromEntries(days.map(d => [d, true])), timeSlots: Object.fromEntries(days.map(d => [d, { start: "09:00", end: "10:00" }])), recurrence: { frequency: "daily", interval: 2 } }))
  assert.deepEqual(result.map(d => d.dateStr), ["2028-02-27", "2028-02-29", "2028-03-02", "2028-03-04"])
})
test("end date is inclusive and may end on a non-teaching day", () => {
  assert.deepEqual(generateClassRecurrence(make({ recurrence: { endCondition: "until", endDate: "2026-10-20" } })).map(d => d.dateStr), ["2026-10-12", "2026-10-14", "2026-10-19"])
})
test("one-day recurrence ends after one occurrence", () => {
  assert.equal(generateClassRecurrence(make({ recurrence: { endCondition: "until", endDate: "2026-10-12" } })).length, 1)
})
test("local morning shifts to the previous UTC day", () => {
  assert.equal(classTimeToIso("2026-10-12", "06:30", "Asia/Ho_Chi_Minh"), "2026-10-11T23:30:00.000Z")
})
test("local teaching times stay fixed across daylight saving", () => {
  const result = generateClassRecurrence(make({ startDate: "2026-03-02", sessions: 2, checkedDays: { monday: true }, timeZone: "America/New_York" }))
  assert.equal(result[0].startTime, "2026-03-02T23:00:00.000Z")
  assert.equal(result[1].startTime, "2026-03-09T22:00:00.000Z")
})
test("DST missing and ambiguous times are rejected", () => {
  assert.throws(() => classTimeToIso("2026-03-08", "02:30", "America/New_York"), /does not exist/)
  assert.throws(() => classTimeToIso("2026-11-01", "01:30", "America/New_York"), /ambiguous/)
})
for (const [name, values] of [
  ["invalid calendar date", { startDate: "2026-02-30" }],
  ["reversed date range", { recurrence: { endCondition: "until", endDate: "2026-10-11" } }],
  ["zero interval", { recurrence: { interval: 0 } }],
  ["fractional interval", { recurrence: { interval: 1.5 } }],
  ["no selected days", { checkedDays: {} }],
  ["start on unselected day", { startDate: "2026-10-13" }],
  ["too many sessions", { sessions: 501 }],
  ["invalid time zone", { timeZone: "Invalid/Zone" }],
  ["reversed session times", { timeSlots: { monday: { start: "20:00", end: "18:00" } } }],
  ["too long until range", { recurrence: { endCondition: "until", endDate: "2035-01-01" } }],
]) test(name, () => assert.throws(() => generateClassRecurrence(make(values))))
test("no duplicate dates or instants in a long series", () => {
  const result = generateClassRecurrence(make({ sessions: 500 }))
  assert.equal(new Set(result.map(d => d.startTime)).size, 500)
})
test("student IDs are normalized and deduplicated", () => assert.deepEqual(normalizeClassInvitees([2, "2", 3], 1), [2, 3]))
test("invalid students, owner and oversized invitations are rejected", () => {
  for (const ids of [[0], [-1], [1], [1.5], ["bad"], Array.from({ length: 51 }, (_, i) => i + 2)]) assert.throws(() => normalizeClassInvitees(ids, 1))
})
test("existing API accepts weekly and daily templates with a fixed time-zone offset", () => {
  assert.doesNotThrow(() => assertExistingScheduleSupport({ interval: 1 }, generateClassRecurrence(make()), "Asia/Ho_Chi_Minh"))
})
test("existing API cannot save a preview with an interval greater than one", () => {
  assert.throws(() => assertExistingScheduleSupport({ interval: 2 }, generateClassRecurrence(make()), "Asia/Ho_Chi_Minh"), /preview only/)
})
test("existing API cannot save a series crossing a time-zone offset change", () => {
  const dates = generateClassRecurrence(make({ startDate: "2026-03-02", sessions: 2, checkedDays: { monday: true }, timeZone: "America/New_York" }))
  assert.throws(() => assertExistingScheduleSupport({ interval: 1 }, dates, "America/New_York"), /clock change/)
})
