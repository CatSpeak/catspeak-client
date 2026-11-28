import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

vi.mock("@/features/auth/components/popups/policies/PrivacyPolicy", () => ({
  default: () => <div>policy-body</div>,
}))

vi.mock("@/shared/context/LanguageContext", () => ({
  useLanguage: () => ({
    t: { policies: { privacyPolicy: { title: "Chính sách bảo mật" } } },
    language: "vi",
    toggleLanguage: vi.fn(),
  }),
}))

import PolicyPage from "./PolicyPage"

const policyDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../components/popups/policies",
)

const readPolicy = (fileName) =>
  fs.readFileSync(path.join(policyDir, fileName), "utf8")

describe("ISS-41: /policy mobile layout and link contrast", () => {
  it("uses responsive padding and a non-overlapping language button", () => {
    const html = renderToStaticMarkup(<PolicyPage />)

    expect(html).toContain("px-3 py-6")
    expect(html).toContain("sm:px-4 sm:py-10")
    expect(html).toContain("rounded-2xl")
    expect(html).toContain("sm:rounded-[40px]")
    expect(html).toContain("flex justify-end sm:absolute sm:right-6 sm:top-6")
    expect(html).toContain("text-2xl font-bold sm:text-4xl")
    expect(html).toContain("p-5 sm:p-8 md:p-14")
    expect(html).toContain("overflow-x-clip")
  })

  it("drops the inline red colour and uses break-all dark-mode links", () => {
    for (const fileName of [
      "PrivacyPolicy.jsx",
      "IntellectualPropertyPolicy.jsx",
      "TermsOfService.jsx",
      "PaymentPolicy.jsx",
    ]) {
      const source = readPolicy(fileName)

      expect(source).not.toContain("colors.red[700]")
      expect(source).toContain(
        "break-all text-[#990011] dark:text-[#FF8599]",
      )
    }
  })
})
