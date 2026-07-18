import { useState } from "react";
import { useLanguage } from "@/shared/context/LanguageContext.jsx";
import AuthButton from "../../ui/AuthButton";
import TextInput from "@/shared/components/ui/inputs/TextInput";
import { useForgotPasswordMutation } from "@/store/api/authApi";

const RequestOtpStep = ({ onSuccess }) => {
  const { t } = useLanguage();
  const authText = t.auth || {};
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const [forgotPassword, { isLoading: isSendingOtp }] =
    useForgotPasswordMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError(authText.validationEmailRequired || "Please input your email!");
      return;
    }

    try {
      const emailValue = email.trim();
      await forgotPassword({ email: emailValue }).unwrap();
      onSuccess(emailValue);
    } catch (err) {
      console.error("Failed to send OTP:", err);
      const errorMsg = err?.data?.message;
      if (errorMsg === "Email not found") {
        setError(authText.emailNotFound || "Email not found");
      } else {
        setError(errorMsg || authText.sendOtpFailed || "Failed to send OTP.");
      }
    }
  };

  return (
    <div>
      <h2 className="mb-1 text-center text-[28px] font-bold text-[#990011]">
        {authText.forgotStep1Title || "Quên mật khẩu"}
      </h2>
      <p className="mb-6 text-center text-sm text-[#7A7574]">
        {authText.forgotStep1Subtitle ||
          "Đừng lo! Nhập email của bạn và chúng tôi sẽ gửi mã xác thực"}
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="mb-1 block text-xs text-[#606060]">
            {authText.emailLabel || "Email"}
          </label>
          <TextInput
            type="email"
            variant="round"
            placeholder={authText.emailOnlyPlaceholder || "Nhập email của bạn"}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            error={error}
          />
        </div>

        <AuthButton type="submit" disabled={isSendingOtp}>
          {isSendingOtp
            ? authText.sending || "ĐANG GỬI..."
            : authText.sendOtpButton || "Gửi OTP"}
        </AuthButton>
      </form>
    </div>
  );
};

export default RequestOtpStep;
