import { describe, expect, it, vi } from "vitest"
import { toggleConsent } from "./consent"

const deferred = () => {
  let resolve
  const promise = new Promise((res) => {
    resolve = res
  })
  return { promise, resolve }
}

describe("toggleConsent", () => {
  it("ticks the checkbox before the microphone prompt resolves", async () => {
    // Oracle: user ruling 2026-10-31 — checkbox phải tick ngay khi bấm,
    // không chờ hộp xin quyền mic (3-5 giây) của trình duyệt.
    const permission = deferred()
    const onAgreedChange = vi.fn()

    const pending = toggleConsent({
      agreed: false,
      requestPermission: () => permission.promise,
      onAgreedChange,
    })

    expect(onAgreedChange).toHaveBeenCalledTimes(1)
    expect(onAgreedChange).toHaveBeenCalledWith(true)

    permission.resolve(true)
    await pending
    expect(onAgreedChange).toHaveBeenCalledTimes(1)
  })

  it("reverts the tick and reports denial", async () => {
    const onAgreedChange = vi.fn()
    const onPermissionDenied = vi.fn()

    await toggleConsent({
      agreed: false,
      requestPermission: async () => false,
      onAgreedChange,
      onPermissionDenied,
    })

    expect(onAgreedChange.mock.calls).toEqual([[true], [false]])
    expect(onPermissionDenied).toHaveBeenCalledTimes(1)
  })

  it("unticks without asking for permission again", async () => {
    const requestPermission = vi.fn()
    const onAgreedChange = vi.fn()

    await toggleConsent({ agreed: true, requestPermission, onAgreedChange })

    expect(onAgreedChange).toHaveBeenCalledWith(false)
    expect(requestPermission).not.toHaveBeenCalled()
  })

  it("ticks without a permission requester", async () => {
    const onAgreedChange = vi.fn()

    await toggleConsent({ agreed: false, onAgreedChange })

    expect(onAgreedChange).toHaveBeenCalledWith(true)
  })
})
