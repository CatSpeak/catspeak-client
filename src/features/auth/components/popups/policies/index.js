import PrivacyPolicy from "./PrivacyPolicy"
import TermsOfService from "./TermsOfService"
import PaymentPolicy from "./PaymentPolicy"
import IntellectualPropertyPolicy from "./IntellectualPropertyPolicy"
import PlatformRegulationsPolicy from "./PlatformRegulationsPolicy"

// Policy mapping configuration
// Add new policies here by mapping the title text to the component
export const policyComponents = {
  // Privacy Policy - matches Vietnamese, English, and Chinese
  "Chính sách bảo mật - Cat Speak": PrivacyPolicy,
  "Privacy Policy - Cat Speak": PrivacyPolicy,
  "隐私政策 - Cat Speak": PrivacyPolicy,
  // Short i18n keys (from RegisterFormFields / FooterBottom)
  "Chính sách bảo mật": PrivacyPolicy,
  "Privacy Policy": PrivacyPolicy,
  隐私政策: PrivacyPolicy,

  // Terms of Service - matches Vietnamese, English, and Chinese
  "Điều khoản dịch vụ - Cat Speak": TermsOfService,
  "Terms of Service - Cat Speak": TermsOfService,
  "服务条款 - Cat Speak": TermsOfService,
  // Short i18n keys
  "Điều khoản dịch vụ": TermsOfService,
  "Terms of Service": TermsOfService,
  服务条款: TermsOfService,

  // Payment Policy - matches Vietnamese, English, and Chinese
  "Chính sách thanh toán và hoàn tiền - Cat Speak": PaymentPolicy,
  "Payment and Refund Policy - Cat Speak": PaymentPolicy,
  "支付和退款政策 - Cat Speak": PaymentPolicy,
  // Short i18n keys
  "Chính sách thanh toán": PaymentPolicy,
  "Payment Policy": PaymentPolicy,
  支付政策: PaymentPolicy,

  // Intellectual Property Rights - matches Vietnamese, English, and Chinese
  "Quyền sở hữu trí tuệ - Cat Speak": IntellectualPropertyPolicy,
  "Intellectual Property Rights - Cat Speak": IntellectualPropertyPolicy,
  "知识产权 - Cat Speak": IntellectualPropertyPolicy,
  // Short i18n keys
  "Bản quyền sở hữu trí tuệ": IntellectualPropertyPolicy,
  "Intellectual Property Rights": IntellectualPropertyPolicy,
  知识产权政策: IntellectualPropertyPolicy,

  // Platform Regulations (combined tabs)
  "Quy định nền tảng": PlatformRegulationsPolicy,
  "Platform Regulations": PlatformRegulationsPolicy,
  "平台规定": PlatformRegulationsPolicy,
}

// Helper function to get policy component by title
export const getPolicyComponent = (title) => {
  if (!title) return null

  // Try exact match first
  if (policyComponents[title]) {
    return policyComponents[title]
  }

  // Try partial match (for flexibility)
  const matchedKey = Object.keys(policyComponents).find(
    (key) => title.includes(key) || key.includes(title),
  )

  return matchedKey ? policyComponents[matchedKey] : null
}

export {
  PrivacyPolicy,
  TermsOfService,
  PaymentPolicy,
  IntellectualPropertyPolicy,
  PlatformRegulationsPolicy,
}
