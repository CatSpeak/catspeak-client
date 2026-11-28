// @vitest-environment happy-dom
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import LanguagesCard from "./LanguagesCard"
import VideoCard from "./VideoCard"
import FormSelect from "./FormSelect"
import OtpCodeInput from "./contact/OtpCodeInput"

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({ t: { profile: { instructor: {} } } }),
}))

vi.mock("@/shared/components/ui/Dropdown", () => ({
  default: ({ trigger }) => trigger(false, null, () => {}),
}))

const t = { profile: { instructor: {} } }

describe("ISS-25 / ISS-28: instructor components use dark-mode surfaces", () => {
  it("renders LanguagesCard status badges, dividers and text with dark variants", () => {
    const html = renderToStaticMarkup(
      <LanguagesCard
        languagesTeach={[{ language: "English", level: "B2" }]}
        requests={[]}
        t={t}
      />,
    )

    expect(html).toContain("dark:bg-emerald-950/50")
    expect(html).toContain("dark:border-[#2E2E2E]")
    expect(html).toContain("dark:text-white")
  })

  it("renders VideoCard frame, filename and actions with dark variants", () => {
    const html = renderToStaticMarkup(
      <VideoCard
        profile={{ introVideoUrl: "https://cdn.example.com/intro.mp4" }}
        t={t}
      />,
    )

    expect(html).toContain("dark:bg-[#222222]")
    expect(html).toContain("dark:border-[#3F3F3F]")
    expect(html).toContain("dark:text-white")
  })

  it("renders the FormSelect trigger and placeholder with dark variants", () => {
    const html = renderToStaticMarkup(
      <FormSelect
        value=""
        options={[]}
        onChange={vi.fn()}
        placeholder="Chọn ngôn ngữ"
      />,
    )

    expect(html).toContain("dark:bg-[#242424]")
    expect(html).toContain("dark:text-neutral-400")
    expect(html).toContain("dark:border-[#3F3F3F]")
  })

  it("renders the six OTP boxes with dark variants, including the error border", () => {
    const html = renderToStaticMarkup(
      <OtpCodeInput value="123456" onChange={vi.fn()} error ariaLabel="OTP" />,
    )

    expect(html).toContain("dark:bg-[#242424]")
    expect(html).toContain("dark:text-white")
    expect(html).toContain("dark:border-[#3F3F3F]")
    expect(html).toContain("dark:border-red-400")
  })
})
