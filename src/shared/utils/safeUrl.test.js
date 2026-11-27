import { describe, expect, it } from "vitest"
import { getSafeExternalHttpUrl } from "./safeUrl"

describe("getSafeExternalHttpUrl (CS-21)", () => {
  it("rejects script-capable schemes", () => {
    expect(getSafeExternalHttpUrl("javascript:alert(1)")).toBeNull()
    expect(getSafeExternalHttpUrl(" JavaScript:alert(1) ")).toBeNull()
    expect(getSafeExternalHttpUrl("data:text/html,<script>1</script>")).toBeNull()
    expect(getSafeExternalHttpUrl("vbscript:msgbox(1)")).toBeNull()
    expect(getSafeExternalHttpUrl("file:///etc/passwd")).toBeNull()
  })

  it("accepts http(s) URLs", () => {
    expect(getSafeExternalHttpUrl("https://example.com/lesson")).toBe(
      "https://example.com/lesson",
    )
    expect(getSafeExternalHttpUrl("http://example.com")).toBe(
      "http://example.com/",
    )
  })

  it("normalises scheme-less and protocol-relative values", () => {
    expect(getSafeExternalHttpUrl("example.com/lesson")).toBe(
      "https://example.com/lesson",
    )
    expect(getSafeExternalHttpUrl("//example.com/lesson")).toBe(
      "https://example.com/lesson",
    )
  })

  it("rejects empty input", () => {
    expect(getSafeExternalHttpUrl("")).toBeNull()
    expect(getSafeExternalHttpUrl("   ")).toBeNull()
    expect(getSafeExternalHttpUrl(null)).toBeNull()
  })
})
