// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import AudioButton from "./AudioButton"
import useSampleAudio from "../../hooks/useSampleAudio"

vi.mock("../../hooks/useSampleAudio", () => ({
  default: vi.fn(),
}))

describe("TC-FC-041: AudioButton offline/error state icon and hint", () => {
  let container
  let root

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
    document.body.innerHTML = ""
    vi.clearAllMocks()
  })

  it("khi audio lỗi (offline), hiển thị icon no-audio (VolumeX) và gợi ý 'Nghe không được? Xem pinyin'", async () => {
    useSampleAudio.mockReturnValue({
      status: "error",
      play: vi.fn(),
    })

    await act(async () => {
      root.render(
        <AudioButton
          audioPath="/v1/speaking/sample-audio?text=k%C3%A0f%C4%93i"
          pinyin="kāfēi"
        />
      )
    })

    // 1. Icon no-audio (VolumeX, class lucide-volume-x), KHÔNG phải AlertTriangle (lucide-triangle-alert)
    const volumeXIcon = container.querySelector(".lucide-volume-x")
    const triangleAlertIcon = container.querySelector(".lucide-triangle-alert")

    expect(volumeXIcon).not.toBeNull()
    expect(triangleAlertIcon).toBeNull()

    // 2. Gợi ý dưới icon: 'Nghe không được? Xem pinyin'
    expect(container.textContent).toContain("Nghe không được?")
    expect(container.textContent).toContain("Xem pinyin")

    // 3. Bấm 'Xem pinyin' sẽ hiện pinyin
    const pinyinBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent.includes("Xem pinyin")
    )
    expect(pinyinBtn).toBeDefined()

    await act(async () => {
      pinyinBtn.click()
    })

    expect(container.textContent).toContain("kāfēi")
  })

  it("khi audio bình thường (idle/playing), hiển thị icon Volume2 và không hiện gợi ý lỗi", async () => {
    useSampleAudio.mockReturnValue({
      status: "idle",
      play: vi.fn(),
    })

    await act(async () => {
      root.render(
        <AudioButton
          audioPath="/v1/speaking/sample-audio?text=k%C3%A0f%C4%93i"
          pinyin="kāfēi"
        />
      )
    })

    expect(container.querySelector(".lucide-volume-2")).not.toBeNull()
    expect(container.querySelector(".lucide-volume-x")).toBeNull()
    expect(container.textContent).not.toContain("Nghe không được?")
    expect(container.textContent).not.toContain("Xem pinyin")
  })

  it("khi audio đang tải (loading), hiển thị spinner Loader2", async () => {
    useSampleAudio.mockReturnValue({
      status: "loading",
      play: vi.fn(),
    })

    await act(async () => {
      root.render(
        <AudioButton
          audioPath="/v1/speaking/sample-audio?text=k%C3%A0f%C4%93i"
          pinyin="kāfēi"
        />
      )
    })

    expect(container.querySelector(".animate-spin")).not.toBeNull()
  })

  it("khi audio lỗi nhưng không có pinyin, hiển thị fallback thông báo lỗi", async () => {
    useSampleAudio.mockReturnValue({
      status: "error",
      play: vi.fn(),
    })

    await act(async () => {
      root.render(
        <AudioButton
          audioPath="/v1/speaking/sample-audio?text=k%C3%A0f%C4%93i"
        />
      )
    })

    expect(container.querySelector(".lucide-volume-x")).not.toBeNull()
    expect(container.textContent).toContain("Không tải được âm thanh")
  })
})
