// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useSubmitLock } from "./useSubmitLock"

describe("useSubmitLock", () => {
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
  })

  it("drops concurrent submissions until the in-flight promise settles", async () => {
    let resolveTask
    const submitSpy = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveTask = resolve
        }),
    )

    let latestPromise = null
    function Probe() {
      const { runLocked } = useSubmitLock()
      return (
        <button
          type="button"
          onClick={() => {
            latestPromise = runLocked(submitSpy)
          }}
        >
          Go
        </button>
      )
    }

    await act(async () => {
      root.render(<Probe />)
    })

    const button = container.querySelector("button")
    let first
    let second
    await act(async () => {
      button.click()
      first = latestPromise
      button.click()
      second = latestPromise
    })

    expect(submitSpy).toHaveBeenCalledTimes(1)
    await expect(second).resolves.toBeUndefined()

    resolveTask("ok")
    await expect(first).resolves.toBe("ok")

    submitSpy.mockImplementationOnce(async () => "second-ok")
    let third
    await act(async () => {
      button.click()
      third = latestPromise
    })
    await expect(third).resolves.toBe("second-ok")
    expect(submitSpy).toHaveBeenCalledTimes(2)
  })
})
