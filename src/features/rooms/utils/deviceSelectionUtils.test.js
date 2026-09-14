// eslint-disable-next-line import/no-unresolved
import test from "node:test"
// eslint-disable-next-line import/no-unresolved
import assert from "node:assert/strict"

import { pickDeviceId } from "./deviceSelectionUtils.js"

const devices = [{ deviceId: "a" }, { deviceId: "b" }]

test("keeps the current selection when it is still available", () => {
  assert.equal(pickDeviceId({ current: "b", stored: "a", available: devices }), "b")
})

test("restores the stored selection when current is empty", () => {
  assert.equal(
    pickDeviceId({ current: "", stored: "b", available: devices, fallback: "a" }),
    "b",
  )
})

test("ignores a stored selection that no longer exists", () => {
  assert.equal(
    pickDeviceId({ current: "", stored: "gone", available: devices, fallback: "a" }),
    "a",
  )
})

test("falls back when neither current nor stored is available", () => {
  assert.equal(
    pickDeviceId({ current: "gone", stored: "also-gone", available: devices, fallback: "a" }),
    "a",
  )
})

test("keeps unvalidated selections while the device list is empty", () => {
  assert.equal(pickDeviceId({ current: "a", available: [] }), "a")
  assert.equal(pickDeviceId({ stored: "b", available: [] }), "b")
  assert.equal(pickDeviceId({ available: [], fallback: "first" }), "first")
})
