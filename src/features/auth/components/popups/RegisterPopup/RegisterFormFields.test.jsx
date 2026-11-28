// @vitest-environment happy-dom
import React from "react"
import { createRoot } from "react-dom/client"
import { act } from "react"
import { describe, expect, it, vi } from "vitest"
import RegisterFormFields from "./RegisterFormFields"

vi.mock("@/shared/components/ui/inputs/TextInput", () => ({
  default: ({ label }) => <input aria-label={label || "input"} />,
}))

vi.mock("../../forms/FormDatePicker", () => ({
  default: ({ label }) => <input aria-label={label || "date"} />,
}))

vi.mock("@/shared/components/ui/Dropdown", () => ({
  default: ({ trigger }) =>
    typeof trigger === "function" ? trigger(false, null, () => {}) : null,
}))

const authText = {
  usernameLabel: "Tên đăng nhập",
  emailLabel: "Email",
  phoneLabel: "Số điện thoại",
  passwordLabel: "Mật khẩu",
  dateOfBirthLabel: "Ngày sinh",
  countryLabel: "Quốc gia",
  preferredLanguageLabel: "Ngôn ngữ",
  languages: { chinese: "Chinese", english: "English", japanese: "Japanese" },
}

const formData = {
  username: "",
  email: "",
  phonePrefix: "+84",
  phoneNumber: "",
  password: "",
  dateOfBirth: "",
  country: "VN",
  preferredLanguage: "chinese",
}

const render = () => {
  const container = document.createElement("div")
  const root = createRoot(container)
  act(() => {
    root.render(
      <RegisterFormFields
        authText={authText}
        formData={formData}
        setFormData={vi.fn()}
        errors={{}}
        setErrors={vi.fn()}
      />,
    )
  })
  return container
}

describe("ISS-45: phone number is an optional register field", () => {
  it("does not render a required asterisk next to the phone label", () => {
    const container = render()
    const phoneLabel = [...container.querySelectorAll("label")].find((label) =>
      label.textContent.includes(authText.phoneLabel),
    )

    expect(phoneLabel).toBeTruthy()
    expect(phoneLabel.textContent).not.toContain("*")
  })

  it("keeps the asterisk on mandatory fields", () => {
    const container = render()
    const requiredLabels = [...container.querySelectorAll("label")].filter(
      (label) => label.textContent.includes("*"),
    )

    expect(requiredLabels.length).toBeGreaterThan(0)
  })
})

describe("ISS-10: language & country dropdowns support dark mode", () => {
  it("renders both dropdown triggers with dark backgrounds and light text", () => {
    const container = render()
    const triggers = [...container.querySelectorAll("button")].filter((button) =>
      button.className.includes("h-14"),
    )

    expect(triggers.length).toBeGreaterThanOrEqual(2)
    for (const trigger of triggers) {
      expect(trigger.className).toContain("bg-white")
      expect(trigger.className).toContain("dark:bg-[#272727]")
      expect(trigger.className).toContain("dark:text-white")
      expect(trigger.className).toContain("dark:hover:border-red-400")
      expect(trigger.className).toContain("dark:focus:border-red-400")
    }
  })

  it("uses a readable placeholder colour in both themes", () => {
    const container = render()
    const placeholders = [...container.querySelectorAll("span")].filter((span) =>
      span.className.includes("text-gray-500"),
    )

    expect(placeholders.length).toBeGreaterThanOrEqual(2)
    for (const placeholder of placeholders) {
      expect(placeholder.className).toContain("dark:text-[#AAAAAA]")
    }
    expect(container.innerHTML).not.toContain("text-[#9e9e9e]")
  })
})
