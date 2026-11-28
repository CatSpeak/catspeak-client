// @vitest-environment happy-dom
import { describe, expect, it } from "vitest"
import { PROFILE_TAB_ALIASES, resolveProfileTab } from "./ProfilePage"

describe("ISS-13: ProfilePage ?tab= normalization", () => {
  it("maps legacy posts/activity aliases to home", () => {
    expect(resolveProfileTab(new URLSearchParams("tab=posts"))).toBe("home")
    expect(resolveProfileTab(new URLSearchParams("tab=activity"))).toBe("home")
  })

  it("keeps the supported tabs", () => {
    expect(resolveProfileTab(new URLSearchParams("tab=friends"))).toBe("friends")
    expect(resolveProfileTab(new URLSearchParams("tab=media"))).toBe("media")
    expect(resolveProfileTab(new URLSearchParams("tab=documents"))).toBe(
      "documents",
    )
    expect(resolveProfileTab(new URLSearchParams("tab=completedClass"))).toBe(
      "completedClass",
    )
  })

  it("defaults to home for missing or unknown tabs", () => {
    expect(resolveProfileTab(new URLSearchParams())).toBe("home")
    expect(resolveProfileTab(new URLSearchParams("tab=whatever"))).toBe("home")
  })

  it("forces the documents tab when a shared material token is present", () => {
    expect(
      resolveProfileTab(
        new URLSearchParams("tab=friends&sharedMaterialToken=abc"),
      ),
    ).toBe("documents")
    expect(PROFILE_TAB_ALIASES.posts).toBe("home")
  })
})
