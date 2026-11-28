import { describe, expect, it } from "vitest"
import {
  IntellectualPropertyPolicy,
  PaymentPolicy,
  PlatformRegulationsPolicy,
  PrivacyPolicy,
  TermsOfService,
  getPolicyComponent,
  POLICY_COMPONENT_BY_KEY,
} from "./index"

describe("ISS-11: policy components resolve by language-independent key", () => {
  it.each([
    ["privacy", PrivacyPolicy],
    ["terms", TermsOfService],
    ["payment", PaymentPolicy],
    ["ip", IntellectualPropertyPolicy],
    ["regulations", PlatformRegulationsPolicy],
  ])("maps %s to its component", (key, component) => {
    expect(POLICY_COMPONENT_BY_KEY[key]).toBe(component)
    expect(getPolicyComponent(key)).toBe(component)
  })

  it("keeps backward compatibility for translated titles", () => {
    expect(getPolicyComponent("Privacy Policy")).toBe(PrivacyPolicy)
    expect(getPolicyComponent("Điều khoản dịch vụ")).toBe(TermsOfService)
    expect(getPolicyComponent("支付政策")).toBe(PaymentPolicy)
    expect(getPolicyComponent("Bản quyền sở hữu trí tuệ")).toBe(
      IntellectualPropertyPolicy,
    )
    expect(getPolicyComponent("Quy định nền tảng")).toBe(
      PlatformRegulationsPolicy,
    )
  })

  it("resolves every Japanese policy title instead of returning undefined", () => {
    expect(getPolicyComponent("プライバシーポリシー")).toBe(PrivacyPolicy)
    expect(getPolicyComponent("プライバシーポリシー - Cat Speak")).toBe(
      PrivacyPolicy,
    )
    expect(getPolicyComponent("利用規約")).toBe(TermsOfService)
    expect(getPolicyComponent("利用規約 - Cat Speak")).toBe(TermsOfService)
    expect(getPolicyComponent("支払い・返金ポリシー")).toBe(PaymentPolicy)
    expect(getPolicyComponent("支払いポリシー")).toBe(PaymentPolicy)
    expect(getPolicyComponent("支払いポリシー - Cat Speak")).toBe(PaymentPolicy)
    expect(getPolicyComponent("支払いおよび返金ポリシー - Cat Speak")).toBe(
      PaymentPolicy,
    )
    expect(getPolicyComponent("著作権")).toBe(IntellectualPropertyPolicy)
    expect(getPolicyComponent("知的財産権")).toBe(IntellectualPropertyPolicy)
    expect(getPolicyComponent("知的財産権 - Cat Speak")).toBe(
      IntellectualPropertyPolicy,
    )
    expect(getPolicyComponent("プラットフォーム規定")).toBe(
      PlatformRegulationsPolicy,
    )
  })

  it("returns null when no policy matches", () => {
    expect(getPolicyComponent("")).toBeNull()
    expect(getPolicyComponent("Không tồn tại")).toBeNull()
  })
})
