import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({ t: {} }),
}))

import AccountSettingsForm from "./AccountSettingsForm"

const baseProps = {
  formData: {
    phonePrefix: "+84",
    fullName: "Nguyen Van A",
    email: "a@example.com",
    phone: "912217479",
    dateOfBirth: "",
  },
  editingField: null,
  isUpdating: false,
  onEdit: vi.fn(),
  onCancel: vi.fn(),
  onSave: vi.fn(),
  onChange: vi.fn(),
  onCountryChange: vi.fn(),
  errors: {},
  t: { profile: { personalInfo: {} } },
}

describe("ISS-56: account settings country/date row", () => {
  it("stacks nationality and date of birth on mobile", () => {
    const html = renderToStaticMarkup(<AccountSettingsForm {...baseProps} />)

    expect(html).toContain("grid grid-cols-1 sm:grid-cols-2 gap-4")
    expect(html).not.toContain('class="grid grid-cols-2 gap-4"')
  })
})
