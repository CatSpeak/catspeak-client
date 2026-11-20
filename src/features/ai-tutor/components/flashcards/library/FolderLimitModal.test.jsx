// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import FolderLimitModal from "./FolderLimitModal"

describe("FolderLimitModal: upgrade CTA and plan name honesty", () => {
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

  it("references the existing Pro plan instead of non-existent Premium plan", async () => {
    const handleClose = vi.fn()
    const handleUpgrade = vi.fn()

    await act(async () => {
      root.render(
        <FolderLimitModal
          isOpen={true}
          maxFolders={3}
          onClose={handleClose}
          onUpgrade={handleUpgrade}
        />
      )
    })

    const text = document.body.textContent || ""

    // Expectation: CatSpeak only has Free and Pro plans. Must NOT reference 'Premium'.
    expect(text).not.toContain("Premium")
    expect(text).toContain("Pro")
  })
})
