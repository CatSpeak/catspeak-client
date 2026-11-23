import test from "node:test" // eslint-disable-line import/no-unresolved
// eslint-disable-next-line import/no-unresolved
import assert from "node:assert/strict"

import {
  getVideoTileRootClass,
  VIDEO_TILE_MIN_HEIGHT_CLASS,
  getVideoTileAvatarSize,
  getVideoTileAvatarClass,
  getVideoTileOverlayPillClass,
  getCompactGeometry,
  tileContentFits,
} from "./videoTileClass.js"

test("full-size tile keeps its 100px minimum (grid layouts depend on it)", () => {
  const cls = getVideoTileRootClass({ isVideoVisible: true })
  assert.ok(cls.includes(VIDEO_TILE_MIN_HEIGHT_CLASS))
})

test("compact tile (watch-together strip) drops the 100px minimum so the card is not squeezed", () => {
  const cls = getVideoTileRootClass({ compact: true })
  assert.ok(
    !cls.includes(VIDEO_TILE_MIN_HEIGHT_CLASS),
    `compact root must not contain ${VIDEO_TILE_MIN_HEIGHT_CLASS}, got: ${cls}`,
  )
  assert.ok(cls.includes("min-h-0"), `compact root must contain min-h-0, got: ${cls}`)
})

test("compact avatar fits the 80px strip tile (no more half-covered avatar)", () => {
  assert.ok(
    getVideoTileAvatarSize({ compact: true }) <= 32,
    `compact avatar must be <= 32px, got ${getVideoTileAvatarSize({ compact: true })}`,
  )
  const cls = getVideoTileAvatarClass({ compact: true })
  assert.ok(
    !cls.includes("48px"),
    `compact avatar class must not pin 48px, got: ${cls}`,
  )
})

test("compact name pill does not grow with the viewport (no sm: growth over the avatar)", () => {
  const cls = getVideoTileOverlayPillClass({ compact: true })
  assert.ok(
    !cls.includes("sm:"),
    `compact pill must not contain viewport sm: variants, got: ${cls}`,
  )
})

test("compact geometry: bottom pill clears the centered avatar (the clipped-card symptom)", () => {
  assert.equal(
    tileContentFits(getCompactGeometry()),
    true,
    `pill overlaps avatar with ${JSON.stringify(getCompactGeometry())}`,
  )
})

test("full-size avatar and pill stay untouched for grid layouts", () => {
  assert.equal(getVideoTileAvatarSize(), 64)
  assert.ok(getVideoTileAvatarClass().includes("48px"))
  assert.ok(getVideoTileOverlayPillClass().includes("sm:px-3"))
})
