import { readFileSync } from "fs"
import path from "path"
import { describe, expect, it } from "vitest"

const source = readFileSync(
  path.resolve(
    globalThis.process.cwd(),
    "src/features/auth/components/popups/policies/PaymentPolicy.jsx",
  ),
  "utf8",
)

describe("R1-4: PaymentPolicy copyright placement", () => {
  it("renders the copyright line after the deposit-terms section", () => {
    const depositIndex = source.indexOf("policy.depositTerms")
    const copyrightIndex = source.indexOf("policy.section10.copyright")

    expect(depositIndex).toBeGreaterThan(-1)
    expect(copyrightIndex).toBeGreaterThan(-1)
    expect(copyrightIndex).toBeGreaterThan(depositIndex)
  })
})
