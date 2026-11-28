// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const { submitContact } = vi.hoisted(() => ({
  submitContact: vi.fn(() => ({ unwrap: async () => ({ ok: true }) })),
}))

vi.mock("@/store/api/contactApi", () => ({
  useSubmitContactMutation: () => [submitContact, { isLoading: false }],
}))

vi.mock("@/shared/components/ui/Modal", () => ({
  default: ({ open, title, children }) =>
    open ? (
      <div data-testid="notice-modal">
        <h3>{title}</h3>
        {children}
      </div>
    ) : null,
}))

vi.mock("@/shared/context/LanguageContext.jsx", () => ({
  useLanguage: () => ({ language: "vi", t: {} }),
}))

import LandingContactForm from "./LandingContactForm"

const setInputValue = (input, value) => {
  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value",
  ).set
  act(() => {
    setter.call(input, value)
    input.dispatchEvent(new Event("input", { bubbles: true }))
  })
}

const setTextareaValue = (textarea, value) => {
  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype,
    "value",
  ).set
  act(() => {
    setter.call(textarea, value)
    textarea.dispatchEvent(new Event("input", { bubbles: true }))
  })
}

describe("ISS-69: LandingContactForm rejects whitespace-only required fields", () => {
  let container
  let root
  let form

  beforeEach(() => {
    submitContact.mockClear()
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
    act(() => {
      root.render(<LandingContactForm />)
    })
    form = container.querySelector("form")
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
  })

  it("marks a whitespace-only required field invalid as soon as the user types", () => {
    const nameInput = form.elements.name
    setInputValue(nameInput, "   ")

    expect(nameInput.validity.valid).toBe(false)
    expect(nameInput.validity.customError).toBe(true)

    setInputValue(nameInput, "Nguyen Van A")

    expect(nameInput.validity.customError).toBe(false)
    expect(nameInput.validity.valid).toBe(true)
  })

  it("does not call submitContact when name or message is only whitespace", () => {
    setInputValue(form.elements.name, "   ")
    setInputValue(form.elements.email, "learner@catspeak.edu.vn")
    setTextareaValue(form.elements.message, "    ")

    act(() => {
      form.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      )
    })

    expect(submitContact).not.toHaveBeenCalled()
    expect(form.elements.name.validity.valid).toBe(false)
    expect(form.elements.message.validity.valid).toBe(false)
  })

  it("submits trimmed values when every required field is valid", async () => {
    setInputValue(form.elements.name, "  Nguyen Van A  ")
    setInputValue(form.elements.email, "  learner@catspeak.edu.vn  ")
    setTextareaValue(form.elements.message, "  Tôi muốn tư vấn.  ")

    await act(async () => {
      form.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      )
    })

    expect(submitContact).toHaveBeenCalledTimes(1)
    expect(submitContact).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Nguyen Van A",
        email: "learner@catspeak.edu.vn",
        language: "vi",
      }),
    )
  })
})
