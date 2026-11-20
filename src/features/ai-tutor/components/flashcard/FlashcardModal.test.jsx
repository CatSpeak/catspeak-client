// @vitest-environment happy-dom
import React, { act, useState } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import FlashcardModal from "./FlashcardModal"

describe("TC-FC-131, TC-FC-132: FlashcardModal focus and typing retention", () => {
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

  it("retains focus in input after typing continuous characters instead of stealing focus", async () => {
    const TestComponent = () => {
      const [editor, setEditor] = useState({ mode: "create", name: "" })

      return (
        <FlashcardModal
          isOpen={Boolean(editor)}
          onClose={() => setEditor(null)}
          title="Tạo thư mục mới"
        >
          {editor && (
            <input
              data-testid="folder-name-input"
              value={editor.name}
              onChange={(e) => setEditor({ ...editor, name: e.target.value })}
            />
          )}
        </FlashcardModal>
      )
    }

    await act(async () => {
      root.render(<TestComponent />)
    })

    const input = document.querySelector('[data-testid="folder-name-input"]')
    expect(input).not.toBeNull()

    // 1. User clicks/focuses into the input
    input.focus()
    expect(document.activeElement).toBe(input)

    // 2. User types 'Q' (first character of 'QA Folder 1')
    await act(async () => {
      const setNativeValue = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value",
      ).set
      setNativeValue.call(input, "Q")
      input.dispatchEvent(new Event("input", { bubbles: true }))
    })

    // Expectation: Focus must remain on the input element.
    expect(document.activeElement).toBe(input)

    // 3. User types subsequent characters: 'A', ' ', 'F', 'o', 'l', 'd', 'e', 'r', ' ', '1'
    const fullText = "QA Folder 1"
    for (let i = 2; i <= fullText.length; i++) {
      const currentSubstr = fullText.slice(0, i)
      await act(async () => {
        const setNativeValue = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          "value",
        ).set
        setNativeValue.call(input, currentSubstr)
        input.dispatchEvent(new Event("input", { bubbles: true }))
      })
      expect(document.activeElement).toBe(input)
    }

    expect(input.value).toBe("QA Folder 1")
  })

  it("calls onClose when Escape key is pressed with latest onClose callback", async () => {
    const handleClose = vi.fn()
    const TestComponent = () => {
      const [count, setCount] = useState(0)

      return (
        <div>
          <button
            data-testid="inc"
            onClick={() => setCount((c) => c + 1)}
          >
            Increment
          </button>
          <FlashcardModal
            isOpen={true}
            onClose={() => handleClose(count)}
            title="Escape Test"
          >
            Content
          </FlashcardModal>
        </div>
      )
    }

    await act(async () => {
      root.render(<TestComponent />)
    })

    // Update count so onClose gets a new reference
    const btn = document.querySelector('[data-testid="inc"]')
    await act(async () => {
      btn.click()
    })

    // Press Escape
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }))
    })

    expect(handleClose).toHaveBeenCalledWith(1)
  })

  it("locks body scrolling when open and restores it when closed", async () => {
    const TestComponent = ({ isOpen }) => (
      <FlashcardModal isOpen={isOpen} onClose={() => {}} title="Scroll Lock Test">
        Modal Content
      </FlashcardModal>
    )

    expect(document.body.style.overflow).toBe("")

    await act(async () => {
      root.render(<TestComponent isOpen={true} />)
    })
    expect(document.body.style.overflow).toBe("hidden")

    await act(async () => {
      root.render(<TestComponent isOpen={false} />)
    })
    expect(document.body.style.overflow).toBe("")
  })
})
