import { describe, expect, it } from "vitest"
import en from "./en"
import ja from "./ja"
import vi from "./vi"
import zh from "./zh"

const takeover = (locale) => locale.placementTest.lifecycle.takeover

describe("takeover leave CTA", () => {
  it("describes navigating home instead of closing a tab the browser owns", () => {
    // Oracle: browser blocks window.close() for tabs the user opened, so the
    // conflict CTA must describe the navigation it actually performs.
    expect(takeover(vi).closeCta).toBe("Quay Về Trang Chủ Hồ Sơ")
    expect(takeover(en).closeCta).toBe("Back to Profile Home")
    expect(takeover(ja).closeCta).toBe("能力プロフィールに戻る")
    expect(takeover(zh).closeCta).toBe("返回能力档案主页")
  })
})
