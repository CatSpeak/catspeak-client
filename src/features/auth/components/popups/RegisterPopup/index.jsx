import { useState } from "react";
import { useLanguage } from "@/shared/context/LanguageContext.jsx";
import AuthButton from "../../ui/AuthButton";
import { useRegisterMutation } from "@/store/api/authApi";
import RegisterFormFields from "./RegisterFormFields";
import AgreementSection from "./AgreementSection";
import Modal from "@/shared/components/ui/Modal";
import { parseRegisterError } from "@/features/auth/utils/registerErrors";

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
};

const RegisterPopup = ({ open, onClose, onSwitchMode }) => {
  const { t } = useLanguage();
  const authText = t.auth;
  const [register, { isLoading }] = useRegisterMutation();
  const [apiError, setApiError] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});


  const validatePhoneInput = (phoneNumber, prefix) => {
    if (!phoneNumber) return true;
    const clean = phoneNumber.replace(/[\s\-()/]/g, "");
    if (!/^[0-9]+$/.test(clean)) return false;

    if (prefix === "+84") {
      return /^(0?[35789]\d{8})$/.test(clean);
    }
    if (prefix === "+86") {
      return /^(1[3-9]\d{9})$/.test(clean);
    }
    if (prefix === "+1") {
      return /^([2-9]\d{9})$/.test(clean);
    }
    return clean.length >= 7 && clean.length <= 15;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    // Form validation
    const localErrors = {};
    if (formData.phoneNumber) {
      if (!validatePhoneInput(formData.phoneNumber, formData.phonePrefix)) {
        localErrors.phoneNumber =
          authText.validationPhoneInvalid ||
          "Số điện thoại không đúng định dạng";
      }
    }

    if (!formData.termsAgreement) {
      localErrors.termsAgreement =
        authText.validationTermsRequired || "Bạn cần đồng ý với điều khoản này";
    }
    if (!formData.policyAgreement) {
      localErrors.policyAgreement =
        authText.validationPolicyRequired ||
        "Bạn cần đồng ý với chính sách này";
    }

    if (Object.keys(localErrors).length > 0) {
      setErrors(localErrors);
      return;
    }

    try {
      const payload = { ...formData };
      if (payload.phoneNumber) {
        let phone = payload.phoneNumber.replace(/\s+/g, "");
        if (phone.startsWith("0")) {
          phone = phone.substring(1);
        }
        const prefix = payload.phonePrefix.replace("+", "");
        payload.phoneNumber = `${prefix}${phone}`;
      }
      delete payload.phonePrefix;

      console.log("Sending payload to backend:", payload);
      await register(payload).unwrap();
      console.log("Registration successful! Please verify your email.");
      onSwitchMode("verify-email", formData.email);
    } catch (err) {
      console.error("Registration failed:", err);

      const { fieldErrors, message } = parseRegisterError(err, authText);
      if (fieldErrors) {
        setErrors(fieldErrors);
      } else {
        setApiError(message);
      }
    }
  };

    const handleClose = () => {
      setFormData(initialFormData);
      setErrors({});
      setApiError(null);
      onClose();
    };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      className="flex flex-col md:max-w-[650px] sm:max-h-[90vh]"
      bodyClassName="px-4 flex-1 overflow-y-auto [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-cath-red-700 [&::-webkit-scrollbar-thumb]:bg-clip-padding [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb:hover]:border-0 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar]:h-[6px]"
    >
      <form onSubmit={handleSubmit} className="pb-12 min-[426px]:pb-6">
        <h2 className="mb-6 pt-2 text-center text-[28px] font-bold text-[#990011] shrink-0">
          {authText.registerTitle}
        </h2>

        {/* Scrollable content now natively handled by Modal body */}
        <div className="-mx-3 px-3">
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
              errors={errors}
              onChange={(field) => (e) => {
                const value =
                  e.target.type === "checkbox"
                    ? e.target.checked
                    : e.target.value;
                setFormData({ ...formData, [field]: value });
                if (errors[field]) {
                  setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors[field];
                    return newErrors;
                  });
                }
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
          <AuthButton type="submit" className="mb-5" disabled={isLoading}>
            {isLoading ? authText.registering : authText.registerButton}
          </AuthButton>

          {/* Switch to login */}
          <div className="relative mb-4 text-center">
            <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-gray-200" />
            <span className="relative z-10 bg-white px-4 font-semibold text-gray-500 text-sm">
              {authText.or}
            </span>
          </div>
          <p className="text-center text-xs text-[#7A7574]">
            {authText.haveAccount}{" "}
            <button
              type="button"
              className="font-semibold text-cath-red-700 hover:underline"
              onClick={() => onSwitchMode("login")}
            >
              {authText.loginLink}
            </button>
          </p>
        </div>
      </form>
    </Modal>
  );
};

export default RegisterPopup;
