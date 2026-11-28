// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, describe, expect, it, vi } from "vitest"
import ExploreCoursesFilterModal from "./ExploreCoursesFilterModal"

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({
    t: {
      courses: {
        student: {
          filterModalTitle: "Bộ lọc",
          enrollmentStatusLabel: "Trạng thái",
          enrollmentStatusAll: "Tất cả",
          enrollmentStatusOpen: "Đang mở",
          enrollmentStatusUpcoming: "Chưa mở",
          enrollmentStatusClosed: "Đã đóng",
          priceRange: "Khoảng giá",
          priceFrom: "Từ (VNĐ)",
          priceTo: "Đến (VNĐ)",
          apply: "Áp dụng",
          clear: "Xóa",
        },
      },
    },
  }),
}))

let root = null

const mount = (props = {}) => {
  const container = document.createElement("div")
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => {
    root.render(
      <ExploreCoursesFilterModal
        open
        onClose={vi.fn()}
        onApply={vi.fn()}
        {...props}
      />,
    )
  })
}

const setInputValue = (input, value) => {
  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value",
  ).set
  setter.call(input, value)
  act(() => {
    input.dispatchEvent(new Event("input", { bubbles: true }))
  })
}

const getInputs = () =>
  Array.from(document.querySelectorAll('input[type="number"]'))

const getButton = (label) =>
  Array.from(document.querySelectorAll("button")).find(
    (button) => button.textContent.trim() === label,
  )

afterEach(() => {
  if (root) {
    act(() => root.unmount())
    root = null
  }
  document.body.innerHTML = ""
})

describe("ISS-49: price range validation inside the filter modal", () => {
  it("blocks minPrice > maxPrice with an inline alert and disabled Apply", () => {
    const onApply = vi.fn()
    mount({ onApply })

    const [minInput, maxInput] = getInputs()
    setInputValue(minInput, "2000000")
    setInputValue(maxInput, "100000")

    const alert = document.querySelector('[role="alert"]')
    expect(alert).toBeTruthy()
    expect(alert.textContent).toContain(
      "Giá tối thiểu không được lớn hơn giá tối đa.",
    )
    expect(minInput.getAttribute("aria-invalid")).toBe("true")

    const applyButton = getButton("Áp dụng")
    expect(applyButton.disabled).toBe(true)

    act(() => {
      applyButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })
    expect(onApply).not.toHaveBeenCalled()
  })

  it("allows Apply after the range is corrected", () => {
    const onApply = vi.fn()
    const onClose = vi.fn()
    mount({ onApply, onClose })

    const [minInput, maxInput] = getInputs()
    setInputValue(minInput, "2000000")
    setInputValue(maxInput, "100000")
    setInputValue(maxInput, "3000000")

    expect(document.querySelector('[role="alert"]')).toBeNull()
    const applyButton = getButton("Áp dụng")
    expect(applyButton.disabled).toBe(false)

    act(() => {
      applyButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(onApply).toHaveBeenCalledWith({
      enrollmentStatus: "all",
      minPrice: "2000000",
      maxPrice: "3000000",
    })
    expect(onClose).toHaveBeenCalled()
  })

  it("rejects negative prices and clears the error from the Clear button", () => {
    mount()

    const [minInput] = getInputs()
    setInputValue(minInput, "-5")

    expect(document.querySelector('[role="alert"]').textContent).toContain(
      "Khoảng giá phải là số không âm.",
    )

    act(() => {
      getButton("Xóa").dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(document.querySelector('[role="alert"]')).toBeNull()
  })
})
