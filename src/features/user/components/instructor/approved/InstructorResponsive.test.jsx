// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, describe, expect, it, vi } from "vitest"

globalThis.IS_REACT_ACT_ENVIRONMENT = true

vi.mock("@/shared/utils/authenticatedMedia", () => ({
  useAuthenticatedMediaUrl: (url) => ({ url }),
}))

vi.mock("@/store/api/instructorApi", () => ({
  useUpdateInstructorBasicInfoMutation: () => [vi.fn(), { isLoading: false }],
}))

vi.mock("@/shared/components/ui/Dropdown", () => ({
  default: ({ trigger }) => trigger(false, null, () => {}),
}))

import VerificationCard from "./VerificationCard"
import PersonalInfoCard from "./PersonalInfoCard"
import LanguagesCard from "./LanguagesCard"

const t = {
  profile: {
    instructor: {},
    personalInfo: { dateOfBirth: "Ngày sinh" },
  },
  courses: { student: { languages: {} } },
}

const requests = [
  {
    requestId: 11,
    language: "English",
    status: "Pending",
    level: "C1",
    credentialUrl: "https://cdn.example.com/english.pdf",
    createdAt: "2026-11-01T00:00:00Z",
  },
  {
    requestId: 22,
    language: "日本語",
    status: "Pending",
    level: "N3",
    credentialUrl: "https://cdn.example.com/japanese.pdf",
    createdAt: "2026-11-02T00:00:00Z",
  },
]

const renderLanguages = (overrides = {}) => {
  const container = document.createElement("div")
  document.body.appendChild(container)
  const root = createRoot(container)
  act(() => {
    root.render(
      <LanguagesCard
        languagesTeach={[{ language: "English", level: "B2" }]}
        requests={requests}
        currentCredentialUrl="https://cdn.example.com/live.pdf"
        t={t}
        {...overrides}
      />,
    )
  })
  return container
}

describe("ISS-27: instructor cards stack on mobile", () => {
  afterEach(() => {
    document.body.innerHTML = ""
  })

  it("VerificationCard rows use flex-col then sm:flex-row", () => {
    const html = renderToStaticMarkup(
      <VerificationCard
        profile={{ email: "catspeakvn@gmail.com", phoneNumber: "+84812217479" }}
        bankAccount={{ bankShortName: "VCB", accountNumber: "0123456789" }}
        t={t}
      />,
    )

    expect(html).toContain("flex flex-col items-start gap-2")
    expect(html).toContain("sm:flex-row")
    expect(html).toContain("sm:w-[205px]")
    expect(html).not.toContain("w-[175px]")
    expect(html).toContain("grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5")
  })

  it("PersonalInfoCard rows use flex-col then sm:flex-row", () => {
    const html = renderToStaticMarkup(
      <PersonalInfoCard
        profile={{ fullName: "Nguyen Van A", email: "a@b.com" }}
        t={t}
      />,
    )

    expect(html).toContain("sm:flex-row")
    expect(html).toContain("sm:w-[182px]")
    expect(html).not.toContain("w-[150px]")
  })

  it("LanguagesCard drops the fixed 1,208px table in favour of a fluid grid", () => {
    const html = renderToStaticMarkup(
      <LanguagesCard
        languagesTeach={[{ language: "English", level: "B2" }]}
        requests={requests}
        currentCredentialUrl="https://cdn.example.com/live.pdf"
        t={t}
      />,
    )

    expect(html).not.toContain("grid-cols-[260px_215px_390px_225px_118px]")
    expect(html).not.toContain("min-w-[1000px]")
    expect(html).toContain("minmax(120px,1.25fr)")
    expect(html).toContain("hidden md:block overflow-x-auto")
    expect(html).toContain("md:hidden")
    expect(html).toContain("hidden md:block")
  })

  it("LanguagesCard renders mobile cards for live, sub and add rows with dark mode", () => {
    const html = renderToStaticMarkup(
      <LanguagesCard
        languagesTeach={[{ language: "English", level: "B2" }]}
        requests={requests}
        currentCredentialUrl="https://cdn.example.com/live.pdf"
        t={t}
      />,
    )

    expect(html).toContain("dark:bg-amber-950/25")
    expect(html).toContain("dark:border-[#3F3F3F]")
    expect(html).toContain("dark:bg-[#222222]")
    expect(html).toContain("Ngày gửi")
    expect(html).toContain("日本語")
  })

  it("renders the disabled mobile action with a neutral border, not the active red one", () => {
    renderLanguages({ requests: [requests[0]] })

    const mobileButton = [...document.querySelectorAll("button")].find(
      (button) =>
        button.className.includes("inline-flex h-8") &&
        button.textContent.trim() === "Cập nhật",
    )

    expect(mobileButton.disabled).toBe(true)
    expect(mobileButton.className).toContain("border-[#E2E2E2]")
    expect(mobileButton.className).toContain("dark:border-[#333333]")
    expect(mobileButton.className).not.toContain("border-[#990011]")
  })

  it("LanguagesCard keeps onUpdateLanguage and onViewRequest wired", () => {
    const onUpdateLanguage = vi.fn()
    const onViewRequest = vi.fn()
    renderLanguages({
      requests: [requests[1]],
      onUpdateLanguage,
      onViewRequest,
    })

    const buttons = [...document.querySelectorAll("button")]
    const updateButton = buttons.find(
      (button) => button.textContent.trim() === "Cập nhật",
    )
    const viewButtons = buttons.filter(
      (button) => button.textContent.trim() === "Xem",
    )

    act(() => {
      updateButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })
    act(() => {
      viewButtons[0].dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(onUpdateLanguage).toHaveBeenCalledWith({
      language: "English",
      level: "B2",
      yearsExperience: 0,
    })
    expect(onViewRequest).toHaveBeenCalledWith(requests[1])
  })
})
