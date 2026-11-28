import { readFileSync } from "fs"
import path from "path"
import { describe, expect, it } from "vitest"

const source = readFileSync(
  path.resolve(
    globalThis.process.cwd(),
    "src/features/reels/components/detail/ReelDetailSlideMobile.jsx",
  ),
  "utf8",
)

describe("ISS-48: mobile reel bookmark label uses the translation object", () => {
  it("no longer reads `language.saved` / `language.save`", () => {
    expect(source).not.toContain("language?.saved")
    expect(source).not.toContain("language?.save")
  })

  it("reads the localized saved/save labels with a Vietnamese fallback", () => {
    expect(source).toContain("t?.catSpeak?.reels?.detail?.saved")
    expect(source).toContain("t?.catSpeak?.reels?.detail?.save")
    expect(source).toContain('"Đã lưu"')
    expect(source).toContain('"Lưu"')
  })

  it("still localizes the empty comments message", () => {
    expect(source).toContain("t?.catSpeak?.reels?.detail?.beFirstToComment")
  })
})
