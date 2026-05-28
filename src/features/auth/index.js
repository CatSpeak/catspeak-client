// Auth components
export { default as AuthIndex } from "./components/index"

// Forms
export { default as AgreementCheckbox } from "./components/forms/AgreementCheckbox"
export { default as FormDatePicker } from "./components/forms/FormDatePicker"
export { default as FormSelectField } from "./components/forms/FormSelectField"
export { default as FormTextField } from "./components/forms/FormTextField"

// Popups
export { default as LoginPopup } from "./components/popups/LoginPopup"
export { default as PolicyModal } from "./components/popups/PolicyModal"
export { default as RegisterPopup } from "./components/popups/RegisterPopup"
export { default as RegisterFormFields } from "./components/popups/RegisterPopup/RegisterFormFields"
export { default as ResetPasswordPopup } from "./components/popups/ResetPasswordPopup"
export { default as RequestOtpStep } from "./components/popups/ResetPasswordPopup/RequestOtpStep"
export { default as ResetPasswordFormStep } from "./components/popups/ResetPasswordPopup/ResetPasswordFormStep"
export { default as VerifyOtpStep } from "./components/popups/ResetPasswordPopup/VerifyOtpStep"
export { default as VerifyEmailOtpPopup } from "./components/popups/VerifyEmailOtpPopup"

// Policies
export {
  IntellectualPropertyPolicy,
  PaymentPolicy,
  PrivacyPolicy,
  TermsOfService,
} from "./components/popups/policies"

// UI
export { default as AuthAgreementCheckbox } from "./components/ui/AgreementCheckbox"
export { default as AuthButton } from "./components/ui/AuthButton"
export { default as AuthPopupAnim } from "./components/ui/AuthPopupAnim"
export { default as FormInput } from "./components/ui/FormInput"
export { default as FormSelect } from "./components/ui/FormSelect"

// Hooks
export { default as useAuth } from "./hooks/useAuth"

// API
export {
  authApi,
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetProfileQuery,
  useVerifyEmailMutation,
  useForgotPasswordMutation,
  useVerifyResetOtpMutation,
  useResetPasswordMutation,
  useRegisterAdminMutation,
  useRefreshTokenMutation,
  useRevokeMutation,
} from "@/store/api/authApi"
