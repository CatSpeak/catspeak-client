import PrivacyPolicy from "./PrivacyPolicy"
import TermsOfService from "./TermsOfService"
import PaymentPolicy from "./PaymentPolicy"
import IntellectualPropertyPolicy from "./IntellectualPropertyPolicy"
import PlatformRegulationsPolicy from "./PlatformRegulationsPolicy"

// Language-independent policy keys. Callers should prefer these over
// translated titles so the modal keeps working when the UI language changes.
export const POLICY_COMPONENT_BY_KEY = {
  privacy: PrivacyPolicy,
  terms: TermsOfService,
  payment: PaymentPolicy,
  ip: IntellectualPropertyPolicy,
  regulations: PlatformRegulationsPolicy,
}

// Policy mapping configuration
// Add new policies here by mapping the title text to the component
export const policyComponents = {
  // Privacy Policy - matches Vietnamese, English, Chinese and Japanese
  "Chính sách bảo mật - Cat Speak": PrivacyPolicy,
  "Privacy Policy - Cat Speak": PrivacyPolicy,
  "隐私政策 - Cat Speak": PrivacyPolicy,
  "プライバシーポリシー - Cat Speak": PrivacyPolicy,
  // Short i18n keys (from RegisterFormFields / FooterBottom)
  "Chính sách bảo mật": PrivacyPolicy,
  "Privacy Policy": PrivacyPolicy,
  隐私政策: PrivacyPolicy,
  プライバシーポリシー: PrivacyPolicy,

  // Terms of Service - matches Vietnamese, English, Chinese and Japanese
  "Điều khoản dịch vụ - Cat Speak": TermsOfService,
  "Terms of Service - Cat Speak": TermsOfService,
  "服务条款 - Cat Speak": TermsOfService,
  "利用規約 - Cat Speak": TermsOfService,
  // Short i18n keys
  "Điều khoản dịch vụ": TermsOfService,
  "Terms of Service": TermsOfService,
  服务条款: TermsOfService,
  利用規約: TermsOfService,

  // Payment Policy - matches Vietnamese, English, Chinese and Japanese
  "Chính sách thanh toán và hoàn tiền - Cat Speak": PaymentPolicy,
  "Payment and Refund Policy - Cat Speak": PaymentPolicy,
  "支付和退款政策 - Cat Speak": PaymentPolicy,
  "支払いおよび返金ポリシー - Cat Speak": PaymentPolicy,
  "支払いポリシー - Cat Speak": PaymentPolicy,
  // Short i18n keys
  "Chính sách thanh toán": PaymentPolicy,
  "Payment Policy": PaymentPolicy,
  支付政策: PaymentPolicy,
  "支払い・返金ポリシー": PaymentPolicy,
  "支払いポリシー": PaymentPolicy,

  // ISS-76: teacher voucher deposit & refund terms (Step2TeacherDeposit)
  "Điều khoản cọc và hoàn tiền": PaymentPolicy,
  "Deposit and Refund Terms": PaymentPolicy,
  押金和退款条款: PaymentPolicy,
  "デポジットおよび返金規約": PaymentPolicy,

  // Intellectual Property Rights - matches Vietnamese, English, Chinese and Japanese
  "Quyền sở hữu trí tuệ - Cat Speak": IntellectualPropertyPolicy,
  "Intellectual Property Rights - Cat Speak": IntellectualPropertyPolicy,
  "知识产权 - Cat Speak": IntellectualPropertyPolicy,
  "知的財産権 - Cat Speak": IntellectualPropertyPolicy,
  // Short i18n keys
  "Bản quyền sở hữu trí tuệ": IntellectualPropertyPolicy,
  "Intellectual Property Rights": IntellectualPropertyPolicy,
  知识产权政策: IntellectualPropertyPolicy,
  著作権: IntellectualPropertyPolicy,
  知的財産権: IntellectualPropertyPolicy,

  // Platform Regulations (combined tabs)
  "Quy định nền tảng": PlatformRegulationsPolicy,
  "Platform Regulations": PlatformRegulationsPolicy,
  "平台规定": PlatformRegulationsPolicy,
  プラットフォーム規定: PlatformRegulationsPolicy,
}

// Helper function to get policy component by key or title
export const getPolicyComponent = (keyOrTitle) => {
  if (!keyOrTitle) return null

  // Language-independent key first
  if (POLICY_COMPONENT_BY_KEY[keyOrTitle]) {
    return POLICY_COMPONENT_BY_KEY[keyOrTitle]
  }

  // Try exact match first
  if (policyComponents[keyOrTitle]) {
    return policyComponents[keyOrTitle]
  }

  // Try partial match (for flexibility)
  const matchedKey = Object.keys(policyComponents).find(
    (key) => keyOrTitle.includes(key) || key.includes(keyOrTitle),
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
