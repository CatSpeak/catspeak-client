import { afterEach, describe, expect, it, vi } from "vitest"
import { requestMicrophoneAccess } from "./microphone"

describe("requestMicrophoneAccess", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("returns true and stops the captured tracks when permission is granted", async () => {
    const stop = vi.fn()
    const getUserMedia = vi.fn().mockResolvedValue({ getTracks: () => [{ stop }] })
    vi.stubGlobal("navigator", { mediaDevices: { getUserMedia } })

    await expect(requestMicrophoneAccess()).resolves.toBe(true)
    expect(getUserMedia).toHaveBeenCalledWith({ audio: true })
    expect(stop).toHaveBeenCalledTimes(1)
  })

  it("returns false instead of throwing when permission is denied", async () => {
    const getUserMedia = vi.fn().mockRejectedValue(new Error("NotAllowedError"))
    vi.stubGlobal("navigator", { mediaDevices: { getUserMedia } })

    await expect(requestMicrophoneAccess()).resolves.toBe(false)
  })

  it("returns false when getUserMedia is unavailable", async () => {
    vi.stubGlobal("navigator", {})

    await expect(requestMicrophoneAccess()).resolves.toBe(false)
  })
})
