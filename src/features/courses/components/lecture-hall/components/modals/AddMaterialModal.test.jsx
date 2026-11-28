// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import AddMaterialModal from "./AddMaterialModal"

const mocks = vi.hoisted(() => ({
  onSubmit: vi.fn(),
  toastError: vi.fn(),
}))

vi.mock("react-hot-toast", () => ({
  default: { error: mocks.toastError, success: vi.fn() },
}))

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({
    t: {
      courses: {
        lectureHall: {
          modals: { addMaterial: {} },
          createPost: { visibleToStudents: "Hiển thị cho học viên" },
        },
      },
    },
  }),
}))

vi.mock("@/shared/components/ui/Modal", () => ({
  default: ({ open, children, footer }) =>
    open ? (
      <div>
        {children}
        {footer}
      </div>
    ) : null,
}))

let container
let root

const render = () => {
  container = document.createElement("div")
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => {
    root.render(
      <AddMaterialModal open onClose={vi.fn()} onSubmit={mocks.onSubmit} />,
    )
  })
  return container
}

const setInputValue = (input, value) => {
  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value",
  ).set
  setter.call(input, value)
  input.dispatchEvent(new Event("input", { bubbles: true }))
}

const submitForm = async (container) => {
  const form = container.querySelector("#add-material-form")
  await act(async () => {
    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true }),
    )
  })
}

beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  mocks.onSubmit.mockReset()
  mocks.toastError.mockReset()
})

afterEach(() => {
  act(() => {
    root.unmount()
  })
  container.remove()
  document.body.innerHTML = ""
})

describe("ISS-64: AddMaterialModal submits through the HTML form", () => {
  it("wires the footer submit button to the form id", () => {
    const container = render()
    const submitButton = [...container.querySelectorAll("button")].find(
      (button) => button.getAttribute("type") === "submit",
    )

    expect(submitButton).toBeTruthy()
    expect(submitButton.getAttribute("form")).toBe("add-material-form")
  })

  it("blocks submission when the title is only whitespace", async () => {
    const container = render()
    const titleInput = container.querySelector('input:not([type="file"])')

    act(() => {
      setInputValue(titleInput, "   ")
    })
    await submitForm(container)

    expect(mocks.onSubmit).not.toHaveBeenCalled()
    expect(mocks.toastError).toHaveBeenCalled()
  })

  it("still requires at least one file for a valid title", async () => {
    const container = render()
    const titleInput = container.querySelector('input:not([type="file"])')

    act(() => {
      setInputValue(titleInput, "Slide bài giảng")
    })
    await submitForm(container)

    expect(mocks.onSubmit).not.toHaveBeenCalled()
  })
})
