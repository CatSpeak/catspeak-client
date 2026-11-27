import { describe, expect, it } from "vitest"
import {
  isProtectedMediaUrl,
  isTrustedApiOrigin,
  resolveProtectedMediaFetchUrl,
} from "./authenticatedMedia"

describe("authenticatedMedia origin hardening (CS-15 / CS-07)", () => {
  it("trusts relative API paths but rejects protocol-relative URLs", () => {
    expect(isTrustedApiOrigin("/api/Post/1/media/2")).toBe(true)
    expect(isTrustedApiOrigin("//evil.example/api/Post/1/media/2")).toBe(false)
    expect(isTrustedApiOrigin("")).toBe(false)
    expect(isTrustedApiOrigin(null)).toBe(false)
  })

  it("trusts only the configured first-party API origins", () => {
    expect(
      isTrustedApiOrigin("https://api.catspeak.com.vn/api/Post/1/media/2"),
    ).toBe(true)
    expect(
      isTrustedApiOrigin("https://social-api.catspeak.com.vn/api/chat/1"),
    ).toBe(true)
    expect(
      isTrustedApiOrigin("https://instructor-api.catspeak.com.vn/media/1"),
    ).toBe(true)
    expect(isTrustedApiOrigin("https://ai.catspeak.com.vn/v1/speaking")).toBe(
      true,
    )
    expect(isTrustedApiOrigin("https://evil.example/api/Post/1/media/2")).toBe(
      false,
    )
    expect(isTrustedApiOrigin("javascript:alert(1)")).toBe(false)
    expect(isTrustedApiOrigin("http://api.catspeak.com.vn/api")).toBe(false)
  })

  it("detects the post media gateway case-insensitively", () => {
    expect(isProtectedMediaUrl("/api/Post/1/media/2")).toBe(true)
    expect(isProtectedMediaUrl("/api/post/1/media/2")).toBe(true)
    expect(
      isProtectedMediaUrl("https://api.catspeak.com.vn/api/Post/1/media/2"),
    ).toBe(true)
  })

  it("does not treat a protected-looking path on a foreign origin as protected", () => {
    expect(
      isProtectedMediaUrl("https://evil.example/api/Post/1/media/2"),
    ).toBe(false)
    expect(isProtectedMediaUrl("https://s3-minio.catspeak.com.vn/a.png")).toBe(
      false,
    )
  })

  it("rejects protocol-relative URLs (CS-21 / R6-3)", () => {
    expect(isProtectedMediaUrl("//evil.example/api/Post/1/media/2")).toBe(false)
    expect(isProtectedMediaUrl("//evil.example/api/admin/bug-reports/1")).toBe(
      false,
    )
  })

  it("routes the post media gateway to the Social API base (R6-1)", () => {
    expect(resolveProtectedMediaFetchUrl("/api/Post/10/media/20")).toBe(
      "/api/social/Post/10/media/20",
    )
    expect(resolveProtectedMediaFetchUrl("/api/post/10/media/20")).toBe(
      "/api/social/post/10/media/20",
    )
  })
})
