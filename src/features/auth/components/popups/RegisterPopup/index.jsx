import { useState } from "react"
import { useLanguage } from "@/shared/context/LanguageContext.jsx"
import AuthButton from "../../ui/AuthButton"
import { useRegisterMutation } from "@/store/api/authApi"
import { useNavigate } from "react-router-dom"
import RegisterFormFields from "./RegisterFormFields"
import AgreementSection from "./AgreementSection"
import Modal from "@/shared/components/ui/Modal"
import { parseRegisterError } from "@/features/auth/utils/registerErrors"

const RegisterPopup = ({ open, onClose, onSwitchMode }) => {
  const { t } = useLanguage()
  const authText = t.auth
  const navigate = useNavigate()

  const [register, { isLoading }] = useRegisterMutation()
  const [apiError, setApiError] = useState(null)

  // Form state
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    dateOfBirth: "",
    preferredLanguage: "",
    password: "",
    country: "",
    termsAgreement: false,
    policyAgreement: false,
  })

  const [errors, setErrors] = useState({})

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError(null)

    try {
      await register(formData).unwrap()
      console.log("Registration successful! Please check your email.")
      onClose()
      navigate("/")
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

  return (
    <Modal open={open} onClose={onClose} className="sm:max-w-2xl">
      <form onSubmit={handleSubmit}>
        <h2 className="mb-6 text-center text-3xl font-bold text-[#8f0d15]">
          {authText.registerTitle}
        </h2>

        {/* Scrollable content */}
        <div className="max-h-[80vh] overflow-y-auto -mx-5 px-5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#990011] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5">
          <RegisterFormFields
            authText={authText}
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
          />

          <div className="mb-6">
            <AgreementSection
              authText={authText}
              formData={formData}
              onChange={(field) => (e) => {
                const value =
                  e.target.type === "checkbox"
                    ? e.target.checked
                    : e.target.value
                setFormData({ ...formData, [field]: value })
              }}
            />
          </div>

          {/* API Error */}
          {apiError && (
            <p className="mb-4 rounded-lg bg-red-100 h-10 flex items-center px-3 text-sm text-red-700">
              {apiError}
            </p>
          )}

          {/* Submit */}
          <AuthButton
            type="submit"
            className="w-full rounded-lg mb-6"
            disabled={isLoading}
          >
            {isLoading
              ? authText.registering
              : authText.registerButton.toUpperCase()}
          </AuthButton>

          {/* Switch to login */}
          <div className="relative mb-4 text-center">
            <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-gray-200" />
            <span className="relative z-10 bg-white px-4 font-semibold text-gray-500 text-sm">
              {authText.or}
            </span>
          </div>
          <p className="text-center text-sm text-[#7A7574]">
            {authText.haveAccount}{" "}
            <button
              type="button"
              className="font-semibold text-[#990011] hover:underline"
              onClick={() => onSwitchMode("login")}
            >
              {authText.loginLink}
            </button>
          </p>
        </div>
      </form>
    </Modal>
  )
}

export default RegisterPopup
