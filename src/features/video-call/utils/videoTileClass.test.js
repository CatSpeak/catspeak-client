import test from "node:test" // eslint-disable-line import/no-unresolved
// eslint-disable-next-line import/no-unresolved
import assert from "node:assert/strict"

import {
  getVideoTileRootClass,
  VIDEO_TILE_MIN_HEIGHT_CLASS,
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
