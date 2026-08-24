import { useState } from "react"
import { useLanguage } from "@/shared/context/LanguageContext.jsx"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import { useRegisterMutation } from "@/store/api/authApi"
import RegisterFormFields from "./RegisterFormFields"
import AgreementSection from "./AgreementSection"
import Modal from "@/shared/components/ui/Modal"
import {
  parseRegisterError,
  validatePhoneInput,
} from "@/features/auth/utils/registerErrors"
import { getBrowserTimeZone } from "@/shared/constants/timezones"

const initialFormData = {
  username: "",
  email: "",
  phonePrefix: "+84",
  phoneNumber: "",
  dateOfBirth: "",
  preferredLanguage: "",
  password: "",
  country: "",
  termsAgreement: false,
  policyAgreement: false,
  isEmailNotificationEnabled: true,
}

const RegisterPopup = ({ open, onClose, onSwitchMode }) => {
  const { t } = useLanguage()
  const authText = t.auth
  const [register, { isLoading }] = useRegisterMutation()
  const [apiError, setApiError] = useState(null)
  const [formData, setFormData] = useState(initialFormData)
  const [errors, setErrors] = useState({})

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError(null)

    // Form validation
    const localErrors = {}
    if (formData.phoneNumber) {
      if (!validatePhoneInput(formData.phoneNumber, formData.phonePrefix)) {
        localErrors.phoneNumber =
          authText.validationPhoneInvalid ||
          "Số điện thoại không đúng định dạng"
      }
    }

    if (!formData.termsAgreement) {
      localErrors.termsAgreement =
        authText.validationTermsRequired || "Bạn cần đồng ý với điều khoản này"
    }
    if (!formData.policyAgreement) {
      localErrors.policyAgreement =
        authText.validationPolicyRequired || "Bạn cần đồng ý với chính sách này"
    }

    if (Object.keys(localErrors).length > 0) {
      setErrors(localErrors)
      return
    }

    try {
      const payload = {
        ...formData,
        timeZone: getBrowserTimeZone(),
      }
      if (payload.phoneNumber) {
        let phone = payload.phoneNumber.replace(/\s+/g, "")
        if (phone.startsWith("0")) {
          phone = phone.substring(1)
        }
        const prefix = payload.phonePrefix.replace("+", "")
        payload.phoneNumber = `${prefix}${phone}`
      }
      delete payload.phonePrefix

      console.log("Sending payload to backend:", payload)
      await register(payload).unwrap()
      console.log("Registration successful! Please verify your email.")
      onSwitchMode("verify-email", formData.email)
    } catch (err) {
      console.error("Registration failed:", err)

      const { fieldErrors, message } = parseRegisterError(err, authText)
      if (fieldErrors) {
        setErrors(fieldErrors)
      } else {
        setApiError(message)
      }
    }
  }

  const handleClose = () => {
    setFormData(initialFormData)
    setErrors({})
    setApiError(null)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      showCloseButton={true}
      className="max-w-3xl rounded-none md:rounded-xl md:border md:border-border"
      headerClassName="flex items-center justify-between p-4 sm:p-6 pb-0"
      bodyClassName="px-4 sm:px-6 flex-1 overflow-y-auto"
      footerClassName="p-4 sm:p-6"
      footer={
        <div className="w-full">
          {/* Submit */}
          <PillButton
            form="register-form"
            type="submit"
            className="w-full mb-2"
            loading={isLoading}
          >
            {isLoading ? authText.registering : authText.registerButton}
          </PillButton>

          {/* Switch to login */}
          <p className="text-center text-xs text-secondary">
            {authText.haveAccount}{" "}
            <button
              type="button"
              className="font-semibold text-primary hover:underline"
              onClick={() => onSwitchMode("login")}
            >
              {authText.loginLink}
            </button>
          </p>
        </div>
      }
    >
      <form id="register-form" onSubmit={handleSubmit}>
        <h2 className="text-center text-3xl font-bold text-primary mb-6">
          {authText.registerTitle}
        </h2>

        <RegisterFormFields
          authText={authText}
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          setErrors={setErrors}
        />

        <AgreementSection
          authText={authText}
          formData={formData}
          errors={errors}
          onChange={(field) => (e) => {
            const value =
              e.target.type === "checkbox" ? e.target.checked : e.target.value
            setFormData({ ...formData, [field]: value })
            if (errors[field]) {
              setErrors((prev) => {
                const newErrors = { ...prev }
                delete newErrors[field]
                return newErrors
              })
            }
          }}
        />

        {/* API Error */}
        {apiError && (
          <div className="mt-6 rounded-lg bg-red-50 py-3.5 px-4 text-sm text-red-700">
            {apiError}
          </div>
        )}
      </form>
    </Modal>
  )
}

export default RegisterPopup
