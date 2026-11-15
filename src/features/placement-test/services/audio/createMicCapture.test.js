import { afterEach, describe, expect, it, vi } from "vitest"
import { createMicCapture } from "./createMicCapture"

const makeTrack = () => ({
  readyState: "live",
  enabled: true,
  stop: vi.fn(),
})

const setupBrowser = () => {
  const tracks = []

  const makeStream = () => {
    const track = makeTrack()
    tracks.push(track)
    return {
      getAudioTracks: () => [track],
      getTracks: () => [track],
    }
  }

  class FakeAudioContext {
    createMediaStreamSource() {
      return { connect: vi.fn() }
    }

    createAnalyser() {
      return {
        fftSize: 0,
        getFloatTimeDomainData: (buffer) => buffer.fill(0),
      }
    }

    close() {
      return Promise.resolve()
    }
  }

  const getUserMedia = vi.fn(async () => makeStream())

  vi.stubGlobal("window", {
    AudioContext: FakeAudioContext,
    requestAnimationFrame: () => 1,
    cancelAnimationFrame: vi.fn(),
  })
  vi.stubGlobal("navigator", { mediaDevices: { getUserMedia } })

  return { tracks, getUserMedia }
}

describe("createMicCapture mute", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("disables the live track and reports the muted state", async () => {
    // Oracle: user ruling 2026-10-31 — muting must silence the recording track.
    const { tracks } = setupBrowser()
    const capture = createMicCapture()
    await capture.start()

    expect(capture.setMuted(true)).toBe(true)
    expect(tracks[0].enabled).toBe(false)
    expect(capture.isMuted()).toBe(true)

    expect(capture.setMuted(false)).toBe(false)
    expect(tracks[0].enabled).toBe(true)
    expect(capture.isMuted()).toBe(false)
  })

  it("pushes level 0 immediately when muted", async () => {
    // Oracle: user ruling 2026-10-31 — the meter must drop to 0 while muted.
    setupBrowser()
    const capture = createMicCapture()
    const levels = []
    capture.subscribeLevel((value) => levels.push(value))
    await capture.start()

    capture.setMuted(true)

    expect(levels.at(-1)).toBe(0)
  })

  it("keeps the muted state when a new stream starts", async () => {
    const { tracks, getUserMedia } = setupBrowser()
    const capture = createMicCapture()
    await capture.start()
    capture.setMuted(true)

    capture.stop()
    await capture.start()

    expect(getUserMedia).toHaveBeenCalledTimes(2)
    expect(tracks[1].enabled).toBe(false)
  })
})
